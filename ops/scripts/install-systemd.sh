#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/home/dev/thegame"
SYSTEMD_DIR="/etc/systemd/system"
ETC_DIR="/etc/thegame"

NPM_PATH="$(command -v npm || true)"
if [[ -z "$NPM_PATH" ]]; then
  echo "[error] npm not found in PATH; install Node.js/npm first" >&2
  exit 1
fi
NODE_BIN="$(dirname "$NPM_PATH")"

sudo mkdir -p "$ETC_DIR"

# Create env file if missing
if [[ ! -f "$ETC_DIR/thegame.env" ]]; then
  sudo tee "$ETC_DIR/thegame.env" >/dev/null <<'EOF'
# Environment variables for the service (optional)
# EXAMPLE_VAR=value
EOF
  sudo chmod 0640 "$ETC_DIR/thegame.env"
fi

sudo cp "$PROJECT_DIR/ops/systemd/thegame.service" "$SYSTEMD_DIR/thegame.service"
sudo sed -i "s#__NPM_PATH__#${NPM_PATH//\/\\}#g" "$SYSTEMD_DIR/thegame.service"
sudo sed -i "s#__NODE_BIN__#${NODE_BIN//\/\\}#g" "$SYSTEMD_DIR/thegame.service"
sudo cp "$PROJECT_DIR/ops/systemd/thegame-monitor.service" "$SYSTEMD_DIR/thegame-monitor.service"
sudo cp "$PROJECT_DIR/ops/systemd/thegame-monitor.timer" "$SYSTEMD_DIR/thegame-monitor.timer"

sudo systemctl daemon-reload
sudo systemctl enable --now thegame.service
sudo systemctl enable --now thegame-monitor.timer

sudo systemctl --no-pager --full status thegame.service || true
sudo systemctl --no-pager --full status thegame-monitor.timer || true
