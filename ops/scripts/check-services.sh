#!/usr/bin/env bash
set -euo pipefail

services=(
  thegame.service
)

for svc in "${services[@]}"; do
  if ! systemctl is-active --quiet "$svc"; then
    echo "[monitor] $svc is not active; restarting"
    systemctl restart "$svc"
  fi
done
