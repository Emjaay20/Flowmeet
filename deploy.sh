#!/usr/bin/env bash
set -euo pipefail
SERVER_HOST="${FLOWMEET_DEPLOY_HOST:-root@194.163.172.101}"
REMOTE_DIR="/srv/flowmeet-platform"
cd "$(dirname "$0")"
ssh "$SERVER_HOST" "mkdir -p '$REMOTE_DIR' && test -s '$REMOTE_DIR/.env'"
# Server credentials and n8n data remain on the server. Do not copy local .env files.
rsync -az --exclude=node_modules --exclude=.next --exclude=.git --exclude=target --exclude=.lab \
  --exclude='.env*' --exclude=.DS_Store --exclude='._*' ./ "$SERVER_HOST:$REMOTE_DIR/"
ssh -o ServerAliveInterval=30 "$SERVER_HOST" \
  "cd '$REMOTE_DIR' && docker compose -p flowmeet-platform config --quiet && docker compose -p flowmeet-platform build && python3 scripts/bootstrap-n8n.py && docker compose -p flowmeet-platform up -d --wait --wait-timeout 120"
python3 scripts/smoke.py https://flowmeet.aetherhost.com.ng --n8n
