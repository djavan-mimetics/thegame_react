#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/home/dev/thegame}"
BACKEND_DIR="$PROJECT_DIR/backend"

FRONTEND_ENV_SYSTEM="/etc/thegame/thegame.env"
FRONTEND_ENV_USER="$HOME/.config/thegame/thegame.env"
BACKEND_ENV_SYSTEM="/etc/thegame/thegame-backend.env"
BACKEND_ENV_USER="$HOME/.config/thegame/thegame-backend.env"

API_HEALTH_URL="${API_HEALTH_URL:-http://127.0.0.1:8080/health}"
# Nginx usually routes by Host; set NGINX_HEALTH_HOST to match server_name.
NGINX_HEALTH_URL="${NGINX_HEALTH_URL:-http://127.0.0.1/}"
NGINX_HEALTH_HOST="${NGINX_HEALTH_HOST:-app.thegamebrasil.com.br}"

SKIP_DB_START="${SKIP_DB_START:-0}"
SKIP_MIGRATIONS="${SKIP_MIGRATIONS:-0}"
DB_WAIT_SECONDS="${DB_WAIT_SECONDS:-20}"

say() {
  echo -e "\n==> $*"
}

warn() {
  echo "[warn] $*" >&2
}

err() {
  echo "[error] $*" >&2
}

load_env_if_exists() {
  local file="$1"
  if [[ -f "$file" ]]; then
    say "Loading env: $file"
    set -a
    # shellcheck disable=SC1090
    source "$file"
    set +a
    return 0
  fi
  return 1
}

tcp_is_open() {
  local host="$1"
  local port="$2"
  (echo >"/dev/tcp/$host/$port") >/dev/null 2>&1
}

wait_for_tcp() {
  local name="$1"
  local host="$2"
  local port="$3"
  local seconds="$4"

  say "Waiting for $name ($host:$port) up to ${seconds}s"

  local start
  start=$(date +%s)
  while true; do
    if tcp_is_open "$host" "$port"; then
      echo "[ok] $name is reachable"
      return 0
    fi
    local now
    now=$(date +%s)
    if (( now - start >= seconds )); then
      return 1
    fi
    sleep 0.5
  done
}

is_loaded_user() {
  systemctl --user show -p LoadState --value "$1" 2>/dev/null | grep -qx "loaded"
}

is_loaded_system() {
  sudo systemctl show -p LoadState --value "$1" 2>/dev/null | grep -qx "loaded"
}

restart_unit() {
  local svc="$1"

  if is_loaded_user "$svc"; then
    say "Restarting (user): $svc"
    systemctl --user restart "$svc"
    return 0
  fi

  if is_loaded_system "$svc"; then
    say "Restarting (system): $svc"
    sudo systemctl restart "$svc"
    return 0
  fi

  warn "Service not found/loaded: $svc"
  return 1
}

healthcheck_http() {
  local name="$1"
  local url="$2"
  local host_header="${3:-}"
  local tries="${4:-30}"
  local sleep_s="${5:-0.5}"

  say "Healthcheck: $name ($url)"

  local i
  for i in $(seq 1 "$tries"); do
    local code
    if [[ -n "$host_header" ]]; then
      code=$(curl -sS -o /dev/null -H "Host: $host_header" -w "%{http_code}" "$url" || true)
    else
      code=$(curl -sS -o /dev/null -w "%{http_code}" "$url" || true)
    fi

    if [[ "$code" =~ ^2|^3 ]]; then
      echo "[ok] $name http=$code"
      return 0
    fi

    echo "[wait] $name attempt=$i/$tries http=$code"
    sleep "$sleep_s"
  done

  err "$name healthcheck failed"
  return 1
}

healthcheck_api() {
  local url="$1"
  local tries="${2:-30}"
  local sleep_s="${3:-0.5}"

  say "Healthcheck: API ($url)"

  local i
  for i in $(seq 1 "$tries"); do
    local body
    body=$(curl -sS "$url" || true)
    if echo "$body" | grep -q '"ok"\s*:\s*true'; then
      echo "[ok] API responded ok"
      return 0
    fi

    echo "[wait] API attempt=$i/$tries"
    sleep "$sleep_s"
  done

  err "API healthcheck failed"
  return 1
}

say "Deploy all: frontend + backend + nginx"

say "Build frontend"
cd "$PROJECT_DIR"
# Load env for build-time injection (vite build reads env)
load_env_if_exists "$FRONTEND_ENV_SYSTEM" || load_env_if_exists "$FRONTEND_ENV_USER" || true
npm install
npm run build

say "Prepare backend dependencies"
cd "$BACKEND_DIR"
npm install

say "Start DB/Redis (docker compose)"
if [[ "$SKIP_DB_START" == "1" ]]; then
  warn "SKIP_DB_START=1 set; skipping DB/Redis startup"
else
compose_cmd=""
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  compose_cmd="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  compose_cmd="docker-compose"
fi

if [[ -n "$compose_cmd" ]]; then
  $compose_cmd -f "$BACKEND_DIR/docker-compose.yml" up -d || warn "docker compose failed; continuing (migration may fail if DB is unreachable)"
else
  warn "docker/docker-compose not found; skipping DB/Redis startup (migration may fail if DB is unreachable)"
fi
fi

say "Run backend migrations"
# Prefer system env, then user env. Avoid sourcing backend/.env (often not shell-compatible / CRLF).
load_env_if_exists "$BACKEND_ENV_SYSTEM" || load_env_if_exists "$BACKEND_ENV_USER" || warn "No backend env file found; relying on process env/.env handled by node"

if [[ "$SKIP_MIGRATIONS" == "1" ]]; then
  warn "SKIP_MIGRATIONS=1 set; skipping migrations"
else
  # Preflight: show DB target and fail fast if Postgres is unreachable.
  db_url="${DATABASE_URL:-}"
  if [[ -z "$db_url" ]]; then
    warn "DATABASE_URL is not set in shell env; node-pg-migrate will try backend/.env"
  else
    echo "[info] DATABASE_URL=$db_url"
  fi

  if ! wait_for_tcp "postgres" "127.0.0.1" "5432" "$DB_WAIT_SECONDS"; then
    err "Postgres is not reachable on 127.0.0.1:5432 (after ${DB_WAIT_SECONDS}s)"
    err "Fix: ensure DB is running (docker compose up -d in backend/), or point DATABASE_URL to the correct host."
    err "You can bypass with SKIP_MIGRATIONS=1 (not recommended for deploy)."
    exit 1
  fi

  # Compatibility: early deployments created a pgmigrations entry named `001_init`.
  # Newer filenames include an epoch prefix, which would otherwise break ordering checks.
  if command -v psql >/dev/null 2>&1 && [[ -n "${DATABASE_URL:-}" ]]; then
    (psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "UPDATE pgmigrations SET name='1766244797460_001_init' WHERE name='001_init';" >/dev/null 2>&1) || true
  fi

npm run db:migrate
fi

say "Build backend"
npm run build

say "Restart services"
if is_loaded_user thegame.service || is_loaded_user thegame-backend.service || is_loaded_user thegame-monitor.timer; then
  say "Reloading systemd (user)"
  systemctl --user daemon-reload
fi

if is_loaded_system thegame.service || is_loaded_system thegame-backend.service || is_loaded_system thegame-monitor.timer; then
  say "Reloading systemd (system)"
  sudo systemctl daemon-reload
fi

restart_unit thegame-backend.service || true
restart_unit thegame.service || true
restart_unit thegame-monitor.timer || true

say "Restart nginx"
if command -v nginx >/dev/null 2>&1; then
  sudo nginx -t
  sudo systemctl restart nginx
else
  warn "nginx binary not found; skipping nginx restart"
fi

say "Healthchecks"
healthcheck_api "$API_HEALTH_URL"
healthcheck_http "nginx(app)" "$NGINX_HEALTH_URL" "$NGINX_HEALTH_HOST"

say "Done"
