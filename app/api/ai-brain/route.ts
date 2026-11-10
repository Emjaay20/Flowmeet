import { NextResponse } from "next/server";
import { checkRateLimit, clientIp } from "@/app/lib/cache";

const searchUrl = () => process.env.PYTHON_AI_BRAIN_URL || "http://127.0.0.1:8083";

/**
 * Proxies a question to the docs-search service. The answer is always a
 * quoted documentation entry or an explicit "a person should answer"; if the
 * service is down this returns an error instead of a canned reply.
 */
export async function POST(req: Request) {
    const started = Date.now();

    if (!checkRateLimit(`docs:${clientIp(req)}`).allowed) {
        return NextResponse.json({ success: false, error: "Rate limited" }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    if (query.length < 3 || query.length > 500) {
        return NextResponse.json({ success: false, error: "Ask a question of 3 to 500 characters" }, { status: 400 });
    }

    try {
        const res = await fetch(`${searchUrl()}/ai/deflect`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(4000),
            body: JSON.stringify({ query }),
        });
        if (!res.ok) throw new Error(`search service returned HTTP ${res.status}`);
        const data = await res.json();
        return NextResponse.json({ success: true, round_trip_ms: Date.now() - started, data });
    } catch (e) {
        return NextResponse.json(
            { success: false, error: `Docs search unavailable: ${e instanceof Error ? e.message : "error"}` },
            { status: 502 },
        );
    }
}
