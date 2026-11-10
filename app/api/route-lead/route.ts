import { NextResponse } from "next/server";
import { checkRateLimit, clientIp } from "@/app/lib/cache";

const conciergeUrl = () => process.env.GOLANG_CONCIERGE_URL || "http://127.0.0.1:8082";

/**
 * Proxies a routing request to the Go service and returns its answer as-is,
 * along with the measured round trip. If the service is down this returns an
 * error; it never substitutes its own decision.
 */
export async function POST(req: Request) {
    const started = Date.now();

    if (!checkRateLimit(`route:${clientIp(req)}`).allowed) {
        return NextResponse.json({ success: false, error: "Rate limited" }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        return NextResponse.json({ success: false, error: "A valid email is required" }, { status: 400 });
    }

    const payload = {
        email: body.email,
        company: typeof body.company === "string" ? body.company.slice(0, 120) : "",
        role: typeof body.role === "string" ? body.role.slice(0, 120) : "",
        region: typeof body.region === "string" ? body.region.slice(0, 60) : "",
        employees: Number.isFinite(body.employees) ? Math.max(0, Math.floor(body.employees)) : 0,
        estimated_tier: typeof body.estimated_tier === "string" ? body.estimated_tier.slice(0, 60) : "",
        detected_tech_stack: Array.isArray(body.detected_tech_stack) ? body.detected_tech_stack.slice(0, 20).map(String) : [],
        scraper_intent: Number.isFinite(body.scraper_intent) ? Math.floor(body.scraper_intent) : 0,
    };

    try {
        const res = await fetch(`${conciergeUrl()}/route`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(3000),
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`routing service returned HTTP ${res.status}`);
        const data = await res.json();
        return NextResponse.json({ success: true, round_trip_ms: Date.now() - started, data });
    } catch (e) {
        return NextResponse.json(
            { success: false, error: `Routing service unavailable: ${e instanceof Error ? e.message : "error"}` },
            { status: 502 },
        );
    }
}
