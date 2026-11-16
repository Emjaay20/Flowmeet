#!/usr/bin/env python3
"""Small read-only smoke test; no customer records, emails, or meetings created."""
import argparse
import json
import urllib.error
import urllib.request

p = argparse.ArgumentParser()
p.add_argument("base_url", nargs="?", default="https://flowmeet.aetherhost.com.ng")
p.add_argument("--n8n", action="store_true")
args = p.parse_args()
base = args.base_url.rstrip("/")


def request(path, body=None):
    req = urllib.request.Request(base + path, data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=50) as res:
            return res.status, json.load(res)
    except urllib.error.HTTPError as err:
        return err.code, json.load(err)


code, health = request("/api/health")
assert code == 200 and health["status"] == "ok", health
print("PASS service health: crawler, routing, documentation")
code, result = request("/api/n8n-orchestrate", {"email": "bad"})
assert code == 400 and result["success"] is False, result
print("PASS invalid input rejected")
code, result = request("/api/n8n-orchestrate", {"email": "demo@localhost.invalid"})
assert code == 400, result
print("PASS non-demo domain rejected")
for mode in (["direct", "n8n"] if args.n8n else ["direct"]):
    path = "/api/n8n-orchestrate" + ("?via=n8n" if mode == "n8n" else "")
    code, result = request(path, {"email": "demo@stripe.com", "query": "How does lead routing work?"})
    assert code == 200 and result["success"], result
    assert result["mode"] == "PREVIEW_ONLY", result
    assert all(value is False for value in result["side_effects"].values()), result
    assert len(result["node_execution_trace"]) == 3, result
    assert all(s["status"] == "SUCCESS" and s["duration_ms"] >= 0 for s in result["node_execution_trace"]), result
    if mode == "n8n":
        assert result["orchestrator"] == "n8n" and result["n8n_execution_id"], result
    print(f"PASS {mode} preview: {result['total_orchestration_ms']} ms; score={result['payload']['scoring_and_routing']['final_icp_score']}; request={result['request_id']}")
print("PASS no delivery, persistence, or calendar side effects")
