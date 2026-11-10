import { NextResponse } from "next/server";
import { checkRateLimit, clientIp } from "@/app/lib/cache";
import { isAllowedDemoDomain } from "@/app/lib/scrape";

const crawlerUrl = () => process.env.RUST_CRAWLER_URL || "http://127.0.0.1:8081";

/**
 * Proxies a read request to the Rust crawler. Restricted to the demo domain
 * list and rate limited, because the crawler fetches whatever it is given.
 * If the crawler is down this returns an error; it never fabricates a page.
 */
export async function POST(req: Request) {
    const started = Date.now();

    if (!checkRateLimit(`scrape:${clientIp(req)}`).allowed) {
        return NextResponse.json({ success: false, error: "Rate limited" }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    const raw = typeof body?.url === "string" ? body.url.trim().toLowerCase() : "";
    const domain = raw.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    if (!domain) {
        return NextResponse.json({ success: false, error: "A url is required" }, { status: 400 });
    }
    if (!isAllowedDemoDomain(domain)) {
        return NextResponse.json({ success: false, error: "This public endpoint only reads the demo domain list" }, { status: 403 });
    }

    try {
        const res = await fetch(`${crawlerUrl()}/scrape`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(12000),
            body: JSON.stringify({ url: domain, max_tokens: Number.isFinite(body.max_tokens) ? Math.min(body.max_tokens, 8192) : 4096 }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.details || `crawler returned HTTP ${res.status}`);
        return NextResponse.json({ success: true, round_trip_ms: Date.now() - started, data });
    } catch (e) {
        return NextResponse.json(
            { success: false, error: `Crawler could not read the page: ${e instanceof Error ? e.message : "error"}` },
            { status: 502 },
        );
    }
}
