# FlowMeet: Rust platform engineering case study

## Problem and product

An inbound sales request needs website research, qualification, an owner, and a helpful next step. FlowMeet implements those steps as a demonstrable pipeline. A public preview deliberately avoids email delivery, lead storage, and calendar writes.

## Platform decisions

1. **Separate the policy library from HTTP.** The Rust library models subjects, flags, roles, rules, and tenant context. The HTTP adapter accepts identity only from server-created request extensions after bearer authentication. Caller-supplied role headers are not trusted.
2. **Treat outbound HTTP as a security boundary.** Permit public HTTP(S) hostnames on standard ports, validate every resolved address, pin those addresses for the connection, disable proxy inheritance and automatic redirects, and revalidate each redirect. Bound concurrency, response bytes, input bytes, token output, and total fetch time.
3. **Expose failure as failure.** Dependency errors produce a failed preview rather than substituted scores, made-up timings, or an assumed delivery. Timings are measured; request IDs let an operator correlate results.
4. **Make tools executable.** A read-only MCP stdio server exposes architecture context and policy simulation. A protocol smoke test verifies a cross-tenant denial and same-tenant allowance.
5. **Keep demonstration separate from delivery.** The n8n webhook requires a credential and invokes the shared preview implementation. The graph has no Resend, CRM, or persistence node. Production delivery needs a separately reviewed workflow with idempotency and authenticated workspace binding.

## Tradeoffs

The project uses four languages. This demonstrates service integration, but increases deployment and maintenance cost. A small team could reasonably consolidate the router and retrieval service into Rust or the gateway. The Rust extraction and shared library provide the strongest justification for a separate service; the rest is an explicit portfolio tradeoff.

The policy engine uses collections and allocation during role resolution. Capability bitmask checks are small allocation-free operations; this does not make the entire authorization path allocation-free. Criterion measures in-process operations, not network latency or business throughput.

A shared internal token is deliberately simpler than a complete workload identity system. It authenticates one trusted gateway. It is not a substitute for per-customer identity, scoped credentials, or tenant authorization on customer-facing operations.

## Real incident: conflicting gateway routes

On 15 November 2026, two healthy Next.js deployments declared the same Traefik router name with different domain rules. Traefik rejected the conflicting route and returned 404.

We inspected container labels and gateway logs, backed up the deployment configuration, and gave the `.com.ng` deployment a separate route. Both domains returned 200 afterwards. The new platform stack uses its own route and Compose project names to avoid repeating that collision.

## Evidence and boundaries

The repository includes authorization regression tests, outbound URL/IP tests, routing tests, retrieval tests, an MCP protocol smoke test, and a read-only hosted smoke test. The verification report records actual results for this revision.

Helm was subsequently exercised in an isolated kind/Calico cluster, as described below. Flux reconciliation remains unverified. Team adoption, customer conversion improvement, production Rust tenure, and organization-wide Staff-level impact are not established by this repository. Discuss only your actual contribution and operating history in an application.


## Follow-up evidence

The later controlled customer acceptance test demonstrated real persistence, n8n execution, signed delivery tracking, a provider-confirmed booking, and durable duplicate prevention. A real isolated Kubernetes/Calico cluster exercised Helm rollout, actual network-policy enforcement, and rollback after an invalid image. These provide concrete operational evidence beyond static configuration. They remain a single-node lab and a controlled pilot, not proof of multi-team adoption or highly available production Kubernetes. See customer-acceptance.md.
