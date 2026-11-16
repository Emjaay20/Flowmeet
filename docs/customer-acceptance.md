# Customer delivery and Kubernetes acceptance — 16 November 2026

This extends the read-only checks in verification.md. The user explicitly authorised `yusuf@yusufsaka.dev` or `youngmj2010@gmail.com` for a labelled test email and calendar invitation. Only `yusuf@yusufsaka.dev` was used.

## Real customer flow

A dedicated acceptance workspace isolates the test from ordinary customer leads. Its API key is stored only in the private deployment configuration and the encrypted n8n credential store.

The customer-capture workflow `flowmeetCaptureV1` was imported, published, and executed as n8n execution **4**. It called the authenticated lead endpoint with a stable request identifier and an explicit `send_booking_email: true` flag.

Verified results:

- Lead saved in Supabase: `5b458502-591c-514a-ade4-9333b778e2cb`.
- Resend accepted the message: `01a1e369-6879-7574-a32f-97613e234cbe`.
- A real signed `email.delivered` callback was stored in Supabase. This confirms receiving-server acceptance, not that a person read the email.
- Repeating the request returned the same lead ID and email ID, without sending again.
- Reusing the request key with changed input returned 409.
- Unauthenticated lead writes and body-supplied onboarding identities returned 401.
- Another workspace's API key could not read the test lead (404).
- An unsigned delivery callback returned 401.
- Anonymous Supabase access could not read the saved acceptance lead.
- Four local lead-capture checks passed for stable workspace-scoped IDs, changed-payload detection, HTML escaping, and safe booking-link validation.
- Availability was read from Cal.com. Its booking API confirmed an accepted booking with UID `1rh414XArjQrfuFwBZvdUy`.
- Meeting time: **17 November 2026, 09:30–10:00 Africa/Lagos** (08:30–09:00 UTC).
- The attendee name is explicitly labelled `[TEST] FlowMeet acceptance — no attendance required`.
- Repeating the booking request returned the same provider booking; the lead status is stored as `Meeting booked`.

The test booking remains on the calendar. No cancellation was sent. The label makes clear that no attendance is needed.

Re-running `scripts/customer-acceptance.js` inside the configured gateway uses the same durable identities and requires `FLOWMEET_RUN_LIVE_ACCEPTANCE=I_HAVE_RECIPIENT_PERMISSION`. It must not be repurposed for a different recipient without explicit permission. Do not change its request key to force a resend.

## Kubernetes exercise

A real, isolated, single-node kind cluster (`flowmeet-lab`) runs on the VPS inside Docker. Its API binds to host loopback. The public application remains on Docker Compose; this was not a migration of customer traffic.

- Kubernetes server: v1.37.0; kubectl updated to the matching version. The kind node image is pinned by digest in deploy/kind/cluster.yaml.
- Calico v3.33.0 installed and ready, enforcing NetworkPolicy.
- Helm deployed two crawler replicas with non-root execution, readiness/liveness probes, a secret-backed bearer credential, and resource limits.
- Allowed namespace reached crawler health and metrics.
- An unlabelled namespace could not connect to crawler port 8081.
- A control probe could reach a private test HTTP server; curl inside the crawler pod could not, demonstrating CNI egress enforcement independently of the application's URL validation.
- The crawler pod could reach public HTTPS.
- An intentionally missing image failed rollout. Helm rollback restored the previous release and both replicas became ready.
- Helm history records install (revision 1), intentionally broken upgrade (revision 2), and rollback (revision 3).

Runbook:

```sh
cd /srv/flowmeet-platform
bash scripts/bootstrap-kubernetes-lab.sh
bash scripts/verify-kubernetes-lab.sh
```

The lab node has a 4 GiB memory ceiling and two CPU cores. It is a single-node acceptance environment, not a highly available production cluster. Flux reconciliation, autoscaling under load, and Prometheus Operator installation were not exercised. Metrics were checked directly.

## Reliability choices

Leads are saved before sending email. Durable request records isolate idempotency by workspace and detect changed payloads. Durable delivery and booking reservations prevent automatic duplicate external effects after an uncertain timeout. An uncertain result requires operator reconciliation, rather than retrying with a fresh key.

The public preview remains read-only. Customer capture is separate and authenticated. Direct Cal.com booking is currently configured only for the controlled pilot workspace. Other workspaces can store their own HTTPS booking URL and use provider handoff. Live Cal.com cancellation/reschedule webhooks and external CRM writes are separate checks and are not claimed here.

## Deployment recovery

At resume, the previous `/opt/aetherhost/deployments/flowmeet-platform-v2` source directory was absent, although its containers and data volumes remained healthy. Runtime configuration was recovered without exposing secret values, and the source was restored under `/srv/flowmeet-platform`. Compose retains the same project name and data volume. The kind cluster's kubeconfig was re-exported from the existing cluster. No unrelated applications were restored, removed, or redeployed.
