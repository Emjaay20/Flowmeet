#!/usr/bin/env python3
"""Exercise initialization, tool discovery, and a denied cross-tenant action."""
import json
import subprocess
from pathlib import Path
root = Path(__file__).resolve().parents[1]
subprocess.run(["cargo", "build", "--manifest-path", str(root / "crawler/Cargo.toml"), "-p", "flowmeet-agent-tools"], check=True)
messages = [
    {"jsonrpc":"2.0", "id":1, "method":"initialize", "params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke","version":"1"}}},
    {"jsonrpc":"2.0", "method":"notifications/initialized"},
    {"jsonrpc":"2.0", "id":2, "method":"tools/list"},
    {"jsonrpc":"2.0", "id":3, "method":"tools/call", "params":{"name":"flowmeet_check_permission","arguments":{"role":"crawler_agent","action":"crawler:scrape","resource":"domain:example.com","subject_tenant":"alpha","resource_tenant":"beta"}}},
    {"jsonrpc":"2.0", "id":4, "method":"tools/call", "params":{"name":"flowmeet_check_permission","arguments":{"role":"crawler_agent","action":"crawler:scrape","resource":"domain:example.com","subject_tenant":"alpha","resource_tenant":"alpha"}}},
]
p = subprocess.run([str(root / "crawler/target/debug/flowmeet-agent-tools"), "serve-mcp"], input="\n".join(map(json.dumps,messages))+"\n", text=True, capture_output=True, check=True)
responses = [json.loads(line) for line in p.stdout.splitlines()]
assert len(responses) == 4, responses
assert responses[0]["result"]["serverInfo"]["name"] == "flowmeet-platform"
assert len(responses[1]["result"]["tools"]) == 2
assert json.loads(responses[2]["result"]["content"][0]["text"])["allowed"] is False
assert json.loads(responses[3]["result"]["content"][0]["text"])["allowed"] is True
print("PASS MCP initialization, tools/list, cross-tenant denial, same-tenant allow")
