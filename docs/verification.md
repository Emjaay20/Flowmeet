# Verification — 15 November 2026

This report separates local checks, hosted runtime checks, and configuration-only evidence. It is a snapshot, not a guarantee of future availability.

## Local checks

- Rust workspace tests: 21 passed; 3 documentation examples are marked ignored.
- Rust Clippy: passes with warnings treated as errors.
- Rust formatting: passes.
- Go routing: passes with race detection enabled.
- Python retrieval: 2 tests passed (unrelated question escalates; routing answer includes its documentation source).
- TypeScript: passes type checking.
- Next.js: production build passes.
- MCP stdio: initialization, tool discovery, cross-tenant denial, and same-tenant allowance passed.
- Policy security probes: 3/3 passed using an operator identity that could otherwise scrape public domains.
- Helm 3.16.4: chart lint passed; templates rendered. This is not a cluster rollout test.

## Local Rust microbenchmarks

Criterion, macOS ARM64, optimized release build. Short exploratory run: 10 samples, 0.2 s warm-up, 0.5 s measurement per benchmark. Reported ranges are Criterion's estimated intervals. These are not production latency measurements; the sub-nanosecond bitmask result is particularly sensitive to compiler and CPU effects.

| Operation | Observed interval |
|---|---|
| Capability bitmask | 595–631 ps |
| Transitive role resolution | 885–892 ns |
| Standard allow policy | 542–549 ns |
| Explicit deny policy | 654–757 ns |
| 100-rule linear evaluation | 3.542–3.598 µs |

Reproduce with:

```sh
cargo bench -p flowmeet-permissions --manifest-path crawler/Cargo.toml --bench policy_bench -- --sample-size 10 --warm-up-time 0.2 --measurement-time 0.5
```

Only the bitmask operation is described as allocation-free. Full policy evaluation uses collections; this run does not measure allocation counts or sustained traffic throughput.

## Hosted runtime

Deployed to AetherHost at `https://flowmeet.aetherhost.com.ng`, using a separate `flowmeet-platform` Compose project. All five containers report healthy. The independent `.app` deployment still returns 200.

The final hosted smoke test passed:

- Health: crawler, routing, and documentation services available.
- Invalid email and disallowed domain rejected.
- Direct preview: **535 ms**, score 68; request `1b6e9866-ace7-4ed6-bf7a-ce2c998c5d02`.
- n8n preview: **545 ms** inside the shared pipeline, score 68; request `4ca25a61-90dc-47b8-9b54-7b6aa1cd5204`. This excludes the surrounding n8n round trip.
- Both preview responses report no email, lead persistence, or meeting creation; the executed preview and workflow code contain no such write operations.
- Deployed security smoke: missing credentials and spoofed identity headers return 401; authenticated analysis returns 200; loopback, metadata, internal container, and IPv4-mapped loopback targets are blocked.
- The n8n webhook rejects an unauthenticated request.
- The deployed Python retrieval tests passed.
- Browser check: direct execution completed; n8n execution **2** completed with **705 ms** pipeline time, visible result cards, and no review rule triggered for the more specific routing/ICP question.

During n8n startup/recreation, an early request failed visibly rather than returning a fabricated success. A readiness health check was added; bootstrap now waits for health before reporting completion. Both paths then passed.

n8n version: **2.46.6**. Image digest: `sha256:8602f5dfacbe2c931eeafd010de0e68182310e9f309921e780ab69182e92b3ae`.

One post-test memory snapshot (idle/recently exercised, not peak load):

| Container | Observed usage | Configured ceiling |
|---|---:|---:|
| Web | 41.29 MiB | 384 MiB |
| Rust crawler | 15.31 MiB | 128 MiB |
| Go router | 3.89 MiB | 64 MiB |
| Python docs | 64.57 MiB | 128 MiB |
| n8n | 373.60 MiB | 768 MiB |

Do not generalize this snapshot into a capacity guarantee. No sustained load test was performed.

## Scope limits

No customer emails, lead database writes, CRM writes, or calendar reservations are part of the smoke test. These integrations need their own credentialed and idempotent acceptance tests. At this initial read-only verification stage, Kubernetes/Flux files were validated locally; the subsequent isolated cluster exercise is documented below and in customer-acceptance.md. Rust production tenure and team adoption are not inferred from these checks.


## Subsequent live acceptance

On 16 November 2026, real customer persistence, signed email delivery confirmation, pilot calendar booking, and a Kubernetes/Calico rollout-and-rollback exercise were completed. The original read-only smoke test results above remain a historical snapshot. See [customer-acceptance.md](customer-acceptance.md) for the later evidence, test meeting time, and remaining scope limits.
