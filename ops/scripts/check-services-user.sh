#!/usr/bin/env bash
set -euo pipefail

services=(
  thegame.service
)

for svc in "${services[@]}"; do
  if ! systemctl --user is-active --quiet "$svc"; then
    echo "[monitor-user] $svc is not active; restarting"
    systemctl --user restart "$svc"
  fi
done
