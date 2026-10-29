#!/usr/bin/env bash
set -e

SERVER_HOST="root@194.163.172.101"
REMOTE_DIR="/opt/aetherhost/deployments/flowmeet"

echo "============================================================"
echo "🚀 FlowMeet Polyglot Suite Deployment to AetherHost VPS"
echo "Target: $SERVER_HOST"
echo "Directory: $REMOTE_DIR"
echo "Domain: https://flowmeet.aetherhost.com.ng"
echo "============================================================"

# 1. Ensure remote directory exists
echo "📁 [1/4] Preparing remote deployment directory..."
ssh $SERVER_HOST "mkdir -p $REMOTE_DIR"

# 2. Sync codebase
echo "📦 [2/4] Syncing codebase via rsync..."
rsync -avz --delete \
  --exclude="node_modules" \
  --exclude=".next" \
  --exclude=".git" \
  --exclude="crawler/target" \
  --exclude=".DS_Store" \
  ./ $SERVER_HOST:$REMOTE_DIR/

# 3. Build & Orchestrate on Server
echo "🔨 [3/4] Building and launching multi-container services..."
ssh $SERVER_HOST "cd $REMOTE_DIR && docker compose build && docker compose up -d --remove-orphans"

# 4. Verify Service Health
echo "🔍 [4/4] Verifying running containers and health probes..."
ssh $SERVER_HOST "cd $REMOTE_DIR && docker compose ps"

echo ""
echo "============================================================"
echo "🎉 FlowMeet successfully deployed to production!"
echo "Public URL: https://flowmeet.aetherhost.com.ng"
echo "============================================================"
