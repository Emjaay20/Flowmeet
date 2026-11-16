# Operations

## Health and diagnosis

`GET /api/health` checks the crawler, router, and documentation service with bounded requests. It returns 503 if any are unavailable. `n8n_configured` reports configuration presence only; the n8n smoke test verifies execution.

```sh
cd /srv/flowmeet-platform
docker compose -p flowmeet-platform ps
docker compose -p flowmeet-platform logs --tail 50 flowmeet-web flowmeet-crawler
python3 scripts/smoke.py https://flowmeet.aetherhost.com.ng --n8n
docker compose -p flowmeet-platform exec -T flowmeet-web node < scripts/security-smoke.js
```

Crawler `/metrics` is reachable inside the private Compose network. Health/metrics have no bearer requirement and must remain internal. Scrape/analyze require the service bearer credential. Rotate the token in the server `.env` and recreate web and crawler together.

## Rollback

The previous `.com.ng` container `flowmeet-app-1` remains available during initial verification. Stop only the new web service to remove its higher-priority route and return traffic to the previous deployment:

```sh
docker compose -p flowmeet-platform stop flowmeet-web
```

Do not stop Traefik or the separate `.app` deployment. Keep the backup Compose file and previous images until acceptance. A rollback restores the old UI; it does not make the old deployment contain the new backend services.

## Resource budgets

Compose limits: web 384 MiB, crawler 128 MiB, router 64 MiB, docs 128 MiB, n8n 768 MiB. These are configured ceilings, not measured usage. Inspect `docker stats --no-stream` for current usage.

## Kubernetes

The chart deploys the crawler only. Create `flowmeet-service-auth` with key `service-token` in the target namespace before deployment. Use an existing secret manager; never commit its value. Render/lint the chart, use an immutable tested image, validate CNI enforcement of NetworkPolicy, and verify readiness, metrics, rollout, and rollback in a real cluster before claiming Kubernetes production experience. The separate kind/Calico acceptance lab now performs rollout and network-policy checks; it does not move public traffic into Kubernetes.


## Kubernetes acceptance lab

The single-node `flowmeet-lab` kind cluster remains available separately from public application traffic. Use `KUBECONFIG=/srv/flowmeet-platform/.lab/kubeconfig` and the tools in `.lab/tools`. The Helm workload is in `flowmeet-verification`; the negative ingress probe is in `flowmeet-denied`. Only namespaces labelled `flowmeet-access=allowed` can connect to the crawler's HTTP port. Label a monitoring namespace explicitly before scraping it.

The acceptance script exercises health, metrics, actual Calico enforcement, a deliberately failed rollout, and Helm rollback. It does not prove high availability or Flux reconciliation. See customer-acceptance.md for results. The API is bound to host loopback and no public application traffic is routed to this cluster.

## Customer delivery

Resend's live webhook points to `/api/webhooks/resend`. The private signing secret is in the server environment. Accepted and delivered are different states. `GET /api/leads/LEAD_ID/status` requires workspace credentials and returns stored outcomes.

A delivery reservation that remains `dispatching` or `unconfirmed` must be reconciled with the provider before a new request identity is used. Do not force a fresh request key to resolve uncertainty. The dedicated acceptance workspace and test credentials must not be used for ordinary customer data.
