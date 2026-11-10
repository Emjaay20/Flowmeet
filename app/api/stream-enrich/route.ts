import { NextRequest } from "next/server";
import { checkRateLimit, clientIp, getCachedDomainScrape, MAX_REQUESTS_PER_HOUR, setCachedDomainScrape } from "@/app/lib/cache";
import { allowedDemoDomains, isAllowedDemoDomain, scrapeDomain, type ScrapeResult } from "@/app/lib/scrape";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FREE_WEBMAILS = new Set([
    "gmail.com", "googlemail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "icloud.com", "aol.com", "proton.me", "protonmail.com",
]);

const conciergeUrl = () => process.env.GOLANG_CONCIERGE_URL || "http://127.0.0.1:8082";

/**
 * Streams the public demo as server-sent events. Each event has a `log` line;
 * the last one also carries a `payload`. Every number in the stream is
 * measured; when a step cannot run, the stream says so and stops.
 */
export async function POST(req: NextRequest) {
    const started = Date.now();
    const since = () => Date.now() - started;

    let body: { email?: unknown } = {};
    try {
        body = await req.json();
    } catch {
        /* handled below */
    }

    if (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
        return Response.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();
    const domain = email.split("@")[1];
    const isFreeMail = FREE_WEBMAILS.has(domain);

    if (!isFreeMail && !isAllowedDemoDomain(domain)) {
        return Response.json(
            {
                error: `The public demo only reads a short list of sites to protect scraping credits (${allowedDemoDomains().join(", ")}). Self-host Flowmeet to try any domain.`,
            },
            { status: 403 },
        );
    }

    const ip = clientIp(req);
    const limit = checkRateLimit(ip);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const send = (event: Record<string, unknown>) =>
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ time_ms: since(), ...event })}\n\n`));
            const fail = (message: string) => {
                send({ status: "ERROR", error: message, log: `[${since()}ms] ${message}` });
                controller.close();
            };

            try {
                if (!limit.allowed) {
                    send({
                        status: "RATE_LIMITED",
                        error: "rate limited",
                        log: `[${since()}ms] The demo allows ${MAX_REQUESTS_PER_HOUR} runs per hour per visitor. Try again in ${Math.ceil((limit.retryAfterSeconds ?? 0) / 60)} min.`,
                    });
                    controller.close();
                    return;
                }

                send({ status: "RESOLVED", log: `[${since()}ms] Domain: ${domain}` });

                // ── 1. Read the site ────────────────────────────────────────
                let scrape: ScrapeResult | null = null;
                let fromCache = false;

                if (isFreeMail) {
                    send({ status: "SKIPPED", log: `[${since()}ms] ${domain} is a personal mailbox provider, so there is no company site to read.` });
                } else {
                    const cached = getCachedDomainScrape(domain);
                    if (cached) {
                        scrape = cached;
                        fromCache = true;
                        send({ status: "CACHED", log: `[${since()}ms] Using the cached read of ${domain} (under 24 h old). No scrape was made.` });
                    } else {
                        send({ status: "SCRAPING", log: `[${since()}ms] Reading https://${domain}` });
                        const outcome = await scrapeDomain(domain);
                        for (const note of outcome.attempts) send({ status: "SCRAPE_NOTE", log: `[${since()}ms] ${note}` });
                        scrape = outcome.result;
                        if (scrape && scrape.markdown.length > 0) setCachedDomainScrape(domain, scrape);
                    }

                    if (!scrape) return fail(`Could not read ${domain}, so there is nothing to score. No result was made up.`);

                    send({
                        status: "SIGNALS",
                        log: `[${since()}ms] Keywords found on the page — tech: ${scrape.techStack.join(", ") || "none"}; enterprise: ${scrape.indicators.length || "none"}`,
                    });
                }

                // ── 2. Score and route with the Go service ──────────────────
                const t0 = Date.now();
                let route: any;
                try {
                    const res = await fetch(`${conciergeUrl()}/route`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        signal: AbortSignal.timeout(3000),
                        body: JSON.stringify({
                            email,
                            company: isFreeMail ? "" : domain.split(".")[0],
                            estimated_tier: scrape?.sizeTier ?? "",
                            detected_tech_stack: scrape?.techStack ?? [],
                            scraper_intent: scrape?.intentScore ?? 0,
                        }),
                    });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    route = await res.json();
                } catch (e) {
                    return fail(`The routing service did not answer (${e instanceof Error ? e.message : "error"}).`);
                }
                const routeRoundTripMs = Date.now() - t0;

                const member = route.assigned_member || {};
                send({
                    status: "ROUTED",
                    log: `[${since()}ms] Score ${route.final_icp_score}/100 → ${route.qualification_tier} → ${member.name}. Rules ran in ${(route.execution_time_ns / 1000).toFixed(1)} µs (${routeRoundTripMs} ms round trip).`,
                });

                const bookingUrl = route.qualification_tier === "SELF_SERVE" ? "" : process.env.FLOWMEET_BOOKING_URL || "";

                send({
                    status: "DONE",
                    log: `[${since()}ms] Done.`,
                    payload: {
                        email,
                        domain,
                        free_mail: isFreeMail,
                        score: route.final_icp_score,
                        tier: route.qualification_tier,
                        assigned: {
                            name: member.name,
                            title: member.title,
                            territory: member.territory,
                            sample_roster: !!route.sample_roster,
                        },
                        booking_available: !!bookingUrl,
                        site: scrape && {
                            title: scrape.title,
                            description: scrape.description,
                            source: scrape.source,
                            from_cache: fromCache,
                            characters: scrape.markdown.length,
                            tech_stack: scrape.techStack,
                            enterprise_keywords: scrape.indicators,
                            size_guess: scrape.sizeTier,
                            read_ms: fromCache ? 0 : scrape.elapsedMs,
                        },
                        timing: {
                            total_ms: since(),
                            routing_rules_ns: route.execution_time_ns,
                            routing_round_trip_ms: routeRoundTripMs,
                        },
                        note: "Score and tier come from keyword matching on the homepage. They are a rough signal, not a forecast.",
                    },
                });
                controller.close();
            } catch (err) {
                fail(err instanceof Error ? err.message : "Unexpected error.");
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
}
