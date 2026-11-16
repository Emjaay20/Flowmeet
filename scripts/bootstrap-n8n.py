#!/usr/bin/env python3
"""Import the preview webhook credential and workflow into this deployment's n8n.
Run on the deployment host. Never prints or commits the credential value.
The encryption key must remain stable to decrypt stored credentials.
"""
import json
import os
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parents[1]
os.chdir(root)
settings = {}
for line in (root / ".env").read_text().splitlines():
    if "=" in line and not line.lstrip().startswith("#"):
        key, value = line.split("=", 1)
        settings[key.strip()] = value.strip().strip("\"'")
token = settings.get("FLOWMEET_N8N_TOKEN", "")
if len(token) < 32:
    raise SystemExit("FLOWMEET_N8N_TOKEN must contain at least 32 characters")
compose = ["docker", "compose", "-p", "flowmeet-platform"]
# Import while stopped; no concurrent SQLite writers during bootstrap.
subprocess.run(compose + ["stop", "flowmeet-n8n"], check=True)
credential_items = [{"id":"flowmeetPreviewAuth", "name":"FlowMeet workflow authentication", "type":"httpHeaderAuth", "data":{"name":"x-flowmeet-workflow-token", "value":token}}]
capture = bool(settings.get("FLOWMEET_N8N_CAPTURE_TOKEN") and settings.get("FLOWMEET_ACCEPTANCE_API_KEY"))
if capture:
    credential_items += [
        {"id":"flowmeetCaptureWebhookAuth", "name":"FlowMeet customer webhook authentication", "type":"httpHeaderAuth", "data":{"name":"x-flowmeet-capture-token", "value":settings["FLOWMEET_N8N_CAPTURE_TOKEN"]}},
        {"id":"flowmeetCaptureApiKey", "name":"FlowMeet customer workspace API key", "type":"httpHeaderAuth", "data":{"name":"x-api-key", "value":settings["FLOWMEET_ACCEPTANCE_API_KEY"]}},
    ]
credentials = json.dumps(credential_items).encode()
base = compose + ["run", "--rm", "-T", "--no-deps"]
# Stream JSON to stdin: the token never appears in process arguments or host files.
subprocess.run(base + ["--entrypoint", "sh", "flowmeet-n8n", "-c", "umask 077; cat > /tmp/flowmeet-credentials.json; n8n import:credentials --input=/tmp/flowmeet-credentials.json; result=$?; rm -f /tmp/flowmeet-credentials.json; exit $result"], input=credentials, check=True)
subprocess.run(base + ["flowmeet-n8n", "import:workflow", "--input=/workflows/polyglot-revenue-orchestrator.json"], check=True)
subprocess.run(base + ["flowmeet-n8n", "publish:workflow", "--id=flowmeetPreviewV2"], check=True)
if capture:
    subprocess.run(base + ["flowmeet-n8n", "import:workflow", "--input=/workflows/customer-lead-capture.json"], check=True)
    subprocess.run(base + ["flowmeet-n8n", "publish:workflow", "--id=flowmeetCaptureV1"], check=True)
subprocess.run(compose + ["up", "-d", "--wait", "--wait-timeout", "120", "flowmeet-n8n"], check=True)
print("Published preview workflow and, when configured, the separately authenticated customer-capture workflow.")
