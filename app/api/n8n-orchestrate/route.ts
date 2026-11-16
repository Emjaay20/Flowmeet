import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { checkRateLimit, clientIp } from "@/app/lib/cache";
import { isAllowedDemoDomain, scrapeDomain } from "@/app/lib/scrape";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Read-only demonstration: no database writes, bookings, or email delivery. */
export async function POST(req: Request) {
    const started = performance.now();
    const requestId = randomUUID();
    if (!checkRateLimit(`pipeline:${clientIp(req)}`).allowed) {
        return NextResponse.json({ success: false, error: "Rate limited" }, { status: 429 });
    }
    const body = await req.json().catch(() => null);
    if (!body || typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) || body.email.length > 254) {
        return NextResponse.json({ success: false, error: "A valid work email is required" }, { status: 400 });
    }
    const email = body.email.toLowerCase().trim();
    const domain = email.split("@")[1];
    const query = typeof body.query === "string" ? body.query.trim() : "How does lead routing work?";
    if (!isAllowedDemoDomain(domain) || query.length < 3 || query.length > 500) {
        return NextResponse.json({ success: false, error: "Use an allowed demo domain and a question of 3 to 500 characters" }, { status: 400 });
    }
    // The workflow calls this endpoint without ?via=n8n, preventing recursion.
    if (new URL(req.url).searchParams.get("via") === "n8n") {
        const url = process.env.N8N_INTERNAL_WEBHOOK_URL;
        const token = process.env.FLOWMEET_N8N_TOKEN;
        if (!url || !token) return NextResponse.json({ success: false, error: "n8n is not configured" }, { status: 503 });
        try {
            const response = await fetch(url, {
                method: "POST", headers: { "Content-Type": "application/json", "x-flowmeet-workflow-token": token },
                body: JSON.stringify({ ...body, email, query }), signal: AbortSignal.timeout(45000),
            });
            if (!response.ok) throw new Error(`n8n returned HTTP ${response.status}`);
            const result = await response.json();
            if (result.success !== true) throw new Error(result.error || "n8n did not return a completed execution");
            return NextResponse.json({ ...result, orchestrator: "n8n", n8n_round_trip_ms: Math.round(performance.now() - started) });
        } catch (error) {
            return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "n8n unavailable", request_id: requestId }, { status: 502 });
        }
    }
    const traceparent = `00-${requestId.replaceAll("-", "")}-${randomUUID().replaceAll("-", "").slice(0, 16)}-01`;
    const headers = { "Content-Type": "application/json", traceparent };
    const trace: { name: string; status: string; duration_ms: number }[] = [];
    async function measured<T>(name: string, operation: () => Promise<T>): Promise<T> {
        const t = performance.now();
        try {
            const value = await operation();
            trace.push({ name, status: "SUCCESS", duration_ms: Math.round((performance.now() - t) * 100) / 100 });
            return value;
        } catch (error) {
            trace.push({ name, status: "FAILED", duration_ms: Math.round((performance.now() - t) * 100) / 100 });
            throw error;
        }
    }
    async function post(url: string, data: unknown) {
        const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(data), signal: AbortSignal.timeout(5000) });
        if (!response.ok) throw new Error(`Dependency returned HTTP ${response.status}`);
        return response.json();
    }
    try {
        const results = await Promise.allSettled([
            measured("Company website", async () => {
                const outcome = await scrapeDomain(domain, traceparent);
                if (!outcome.result) throw new Error("Company website could not be read");
                return outcome.result;
            }),
            measured("Documentation search", () => post(`${process.env.PYTHON_AI_BRAIN_URL || "http://127.0.0.1:8083"}/ai/deflect`, { query })),
        ]);
        const failed = results.find((r) => r.status === "rejected");
        if (failed?.status === "rejected") throw failed.reason;
        const site = (results[0] as PromiseFulfilledResult<Awaited<ReturnType<typeof scrapeDomain>>["result"]>).value!;
        const docs = (results[1] as PromiseFulfilledResult<Record<string, unknown>>).value;
        const route = await measured("Lead routing", () => post(`${process.env.GOLANG_CONCIERGE_URL || "http://127.0.0.1:8082"}/route`, {
            email, company: domain, role: typeof body.role === "string" ? body.role.slice(0, 120) : "",
            region: typeof body.region === "string" ? body.region.slice(0, 60) : "",
            employees: Number.isFinite(body.employees) ? Math.max(0, Math.min(10000000, Math.floor(body.employees))) : 0,
            estimated_tier: site.sizeTier, detected_tech_stack: site.techStack, scraper_intent: site.intentScore,
        }));
        const reasons: string[] = [];
        if (route.qualification_tier === "VIP_ENTERPRISE") reasons.push("Enterprise lead: review recommended");
        if (docs.resolution_status !== "AUTONOMOUS_DEFLECTION_SUCCESS") reasons.push("Documentation match needs human review");
        return NextResponse.json({
            success: true, request_id: requestId, orchestrator: "direct", mode: "PREVIEW_ONLY",
            total_orchestration_ms: Math.round(performance.now() - started), node_execution_trace: trace,
            payload: { lead: { email, domain }, site, scoring_and_routing: route, rag_deflection: docs,
                circuit_breaker: { requires_hitl_approval: reasons.length > 0, reasons },
                booking_available: Boolean(process.env.FLOWMEET_BOOKING_URL) && route.qualification_tier !== "SELF_SERVE" },
            side_effects: { email_sent: false, lead_persisted: false, meeting_booked: false },
            note: "Homepage keywords are rough signals. Documentation scores are relevance scores, not probabilities. Representatives may be sample entries.",
        }, { headers: { "Cache-Control": "no-store", "x-request-id": requestId } });
    } catch (error) {
        return NextResponse.json({ success: false, request_id: requestId, error: error instanceof Error ? error.message : "Pipeline failed", node_execution_trace: trace }, { status: 502 });
    }
}
