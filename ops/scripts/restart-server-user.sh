#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/home/dev/thegame"
ENV_FILE="$HOME/.config/thegame/thegame.env"

cd "$PROJECT_DIR"

# Load env for build-time injection (vite build reads env)
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

npm install
npm run build

systemctl --user daemon-reload
systemctl --user restart thegame.service
systemctl --user restart thegame-monitor.timer

systemctl --user --no-pager --full status thegame.service || true
