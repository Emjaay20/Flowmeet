export const dynamic = "force-dynamic";
export async function GET() {
    const services = await Promise.all([
        ["crawler", process.env.RUST_CRAWLER_URL],
        ["routing", process.env.GOLANG_CONCIERGE_URL],
        ["documentation", process.env.PYTHON_AI_BRAIN_URL],
    ].map(async ([name, url]) => {
        const start = performance.now();
        try {
            if (!url) throw new Error("Not configured");
            const response = await fetch(`${url}/health`, { cache: "no-store", signal: AbortSignal.timeout(2000) });
            return { name, healthy: response.ok, round_trip_ms: Math.round(performance.now() - start) };
        } catch {
            return { name, healthy: false, round_trip_ms: Math.round(performance.now() - start) };
        }
    }));
    const healthy = services.every(s => s.healthy);
    return Response.json({ status: healthy ? "ok" : "degraded", services, n8n_configured: Boolean(process.env.N8N_INTERNAL_WEBHOOK_URL && process.env.FLOWMEET_N8N_TOKEN) }, { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
