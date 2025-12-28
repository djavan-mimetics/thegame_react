#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/home/dev/thegame"
USER_SYSTEMD_DIR="$HOME/.config/systemd/user"
ENV_DIR="$HOME/.config/thegame"

NPM_PATH="$(command -v npm || true)"
if [[ -z "$NPM_PATH" ]]; then
  echo "[error] npm not found in PATH; install Node.js/npm first" >&2
  exit 1
fi
NODE_BIN="$(dirname "$NPM_PATH")"

mkdir -p "$USER_SYSTEMD_DIR" "$ENV_DIR"

if [[ ! -f "$ENV_DIR/thegame.env" ]]; then
  cat >"$ENV_DIR/thegame.env" <<'EOF'
# Environment variables for the service (optional)
# EXAMPLE_VAR=value
EOF
  chmod 0600 "$ENV_DIR/thegame.env"
fi

if [[ ! -f "$ENV_DIR/thegame-backend.env" ]]; then
  cat >"$ENV_DIR/thegame-backend.env" <<'EOF'
# Environment variables for the backend API service
# Copy from /home/dev/thegame/backend/.env.example and fill secrets.

# Server
PORT=8080
HOST=0.0.0.0
CORS_ORIGIN=*
LOG_LEVEL=info

# Database
DATABASE_URL=postgres://thegame:thegame@localhost:5432/thegame

# Auth
JWT_ACCESS_SECRET=
JWT_ACCESS_TTL_SECONDS=900
REFRESH_TTL_DAYS=30
PASSWORD_RESET_TTL_MINUTES=30
EOF
  chmod 0600 "$ENV_DIR/thegame-backend.env"
fi

cp "$PROJECT_DIR/ops/systemd-user/thegame.service" "$USER_SYSTEMD_DIR/thegame.service"
sed -i "s#__NPM_PATH__#${NPM_PATH//\/\\}#g" "$USER_SYSTEMD_DIR/thegame.service"
sed -i "s#__NODE_BIN__#${NODE_BIN//\/\\}#g" "$USER_SYSTEMD_DIR/thegame.service"

cp "$PROJECT_DIR/ops/systemd-user/thegame-backend.service" "$USER_SYSTEMD_DIR/thegame-backend.service"
sed -i "s#__NODE_BIN__#${NODE_BIN//\/\\}#g" "$USER_SYSTEMD_DIR/thegame-backend.service"
cp "$PROJECT_DIR/ops/systemd-user/thegame-monitor.service" "$USER_SYSTEMD_DIR/thegame-monitor.service"
cp "$PROJECT_DIR/ops/systemd-user/thegame-monitor.timer" "$USER_SYSTEMD_DIR/thegame-monitor.timer"

systemctl --user daemon-reload
systemctl --user enable --now thegame.service
systemctl --user enable --now thegame-backend.service
systemctl --user enable --now thegame-monitor.timer

systemctl --user --no-pager --full status thegame.service || true
systemctl --user --no-pager --full status thegame-backend.service || true
systemctl --user --no-pager --full status thegame-monitor.timer || true
