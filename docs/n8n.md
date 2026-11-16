# n8n preview workflow

The shipped workflow has three nodes:

1. **Authenticated preview webhook:** POST `/webhook/flowmeet-polyglot-triage`, with Header Auth.
2. **Run measured preview:** calls `http://flowmeet-web:3000/api/n8n-orchestrate`. The gateway runs the website research and documentation search concurrently, then routes the lead. A failed dependency fails the execution.
3. **Return actual result:** returns the preview response with `n8n_execution_id`.

The workflow intentionally delegates business logic to one shared implementation. It does not claim to fan out separate n8n nodes, synthesize with a language model, write Supabase records, send Resend messages, or reserve calendar slots.

## Configuration

Compose pins n8n to `2.46.6`; the verification report records the deployed version. The n8n volume is private to this Compose project. Existing historical n8n volumes are preserved.

Set separate random `FLOWMEET_N8N_TOKEN` and `N8N_ENCRYPTION_KEY` values in the private deployment `.env`. The gateway sends `x-flowmeet-workflow-token`; the stored Header Auth credential validates it. Credentials are encrypted by n8n using the configured encryption key. Keep that key stable and backed up securely.

On the deployment host:

```sh
cd /srv/flowmeet-platform
python3 scripts/bootstrap-n8n.py
python3 scripts/smoke.py https://flowmeet.aetherhost.com.ng --n8n
```

Bootstrap imports the credential without printing its value, imports the JSON workflow, publishes the workflow, and starts n8n. It stops n8n before editing the SQLite database. Re-running bootstrap updates the dedicated preview workflow and credential; do not use it against an unrelated n8n instance.

The web application invokes the authenticated internal webhook when `/api/n8n-orchestrate?via=n8n` is selected. The workflow calls the direct endpoint without that query parameter, so it cannot recurse.

## Editor access

n8n is bound only to server loopback at port 5680. It is not exposed through the public domain. Open an SSH tunnel:

```sh
ssh -L 5680:127.0.0.1:5680 root@194.163.172.101
```

Then open `http://localhost:5680`. Complete the owner account setup if this fresh instance requests it. Cookie transport is configured for this loopback HTTP tunnel; use secure cookies and HTTPS if you later publish an editor domain. No editor password is stored in source.

Execution payload saving is disabled for successful, failed, and manual runs to reduce retained personal data. The application still receives the result and execution ID. Inspect node definitions in the editor or download `/workflows/polyglot-revenue-orchestrator.json`.

## Troubleshooting

- **401:** missing/wrong Header Auth credential. Verify the gateway token and n8n credential match; do not print them in logs.
- **404 webhook:** the workflow is unpublished or not loaded. Bootstrap publishes it using the server CLI.
- **502 from the app:** n8n or a dependency failed. Check Compose status and logs. No fabricated fallback is returned.
- **No owner login yet:** initial owner setup is independent of the imported webhook workflow.

This setup follows n8n's [server CLI](https://docs.n8n.io/hosting/cli-commands/) and [Webhook authentication](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/) documentation.


## Separate customer-capture workflow

When the capture credentials are configured, bootstrap also imports and publishes `flowmeetCaptureV1` from `n8n/customer-lead-capture.json`. Its webhook uses a separate token and its HTTP node has a workspace API key credential. The preview workflow remains read-only; customer capture persists data and can send a booking email only when explicitly requested. The public API bridge verifies the caller belongs to the configured capture workspace before invoking it. The controlled live test executed this workflow and verified duplicate prevention and delivery. See user-guide.md and customer-acceptance.md.
