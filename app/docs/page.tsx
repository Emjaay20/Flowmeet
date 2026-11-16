"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Loader2, ShieldCheck, Workflow, Terminal, Activity } from "lucide-react";

interface Result {
    success: boolean; error?: string; request_id?: string; mode?: string; orchestrator?: string;
    n8n_execution_id?: string; total_orchestration_ms?: number;
    node_execution_trace?: { name: string; status: string; duration_ms: number }[];
    payload?: { scoring_and_routing: { final_icp_score: number; qualification_tier: string; sample_roster: boolean; assigned_member: { name: string } }; rag_deflection: { direct_answer: string; confidence_score: number }; circuit_breaker: { requires_hitl_approval: boolean; reasons: string[] }; site: { techStack: string[]; source: string } };
}

export default function DocsPage() {
    const [mode, setMode] = useState("direct");
    const [email, setEmail] = useState("demo@stripe.com");
    const [query, setQuery] = useState("How does lead routing work?");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Result | null>(null);
    async function run() {
        setLoading(true); setResult(null);
        try {
            const response = await fetch(`/api/n8n-orchestrate${mode === "n8n" ? "?via=n8n" : ""}`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, query }),
            });
            setResult(await response.json());
        } catch { setResult({ success: false, error: "Could not reach the application. Please try again." }); }
        finally { setLoading(false); }
    }
    return <main className="min-h-screen bg-[#f7f8fa] text-zinc-950">
        <nav className="max-w-6xl mx-auto px-6 py-7 flex justify-between items-center border-b border-zinc-200">
            <Link href="/" className="font-bold text-xl tracking-tight">Flowmeet<span className="text-emerald-600">.</span></Link>
            <Link href="/guide" className="flex items-center gap-2 text-sm text-zinc-600">How to use FlowMeet →</Link>
        </nav>
        <div className="max-w-6xl mx-auto px-6 py-14 md:py-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-1 text-xs font-medium"><Activity size={13}/> Platform walkthrough</div>
            <h1 className="text-4xl md:text-6xl tracking-tight font-semibold mt-6 max-w-3xl leading-[1.08]">From a company email<br/>to an informed next step.</h1>
            <p className="text-lg text-zinc-600 max-w-2xl mt-6 leading-relaxed">See the website research, routing rules, and documentation search working together. Every result comes from a service response. Failures stay visible.</p>
            <div className="grid md:grid-cols-3 gap-4 mt-10 mb-14">
                {[{icon: ShieldCheck, title:"A clear security boundary", text:"The Rust crawler requires a service credential and validates network destinations, including redirects."}, {icon: Activity,title:"Measured, not assumed",text:"Results show actual service timings, website signals, and a request identifier."}, {icon: Workflow,title:"An inspectable workflow",text:"Choose a direct run or an authenticated n8n workflow. Both use the same preview pipeline."}].map(({icon:Icon,title,text})=><div key={title} className="bg-white border border-zinc-200 rounded-2xl p-6"><Icon size={22} className="text-emerald-700 mb-5"/><h2 className="font-semibold mb-2">{title}</h2><p className="text-sm text-zinc-600 leading-relaxed">{text}</p></div>)}
            </div>
            <section id="pipeline" className="grid lg:grid-cols-[0.85fr_1.15fr] rounded-3xl border border-zinc-200 overflow-hidden bg-white shadow-sm">
                <div className="p-7 md:p-10 border-b lg:border-b-0 lg:border-r border-zinc-200">
                    <span id="n8n-tester" className="text-xs uppercase tracking-widest text-emerald-700 font-semibold">Try the pipeline</span>
                    <h2 className="text-2xl font-semibold mt-3 mb-3">One run. Three real services.</h2>
                    <p className="text-sm text-zinc-600 leading-relaxed mb-7">This is a read-only preview. No emails are sent, no leads are stored, and no calendar slots are reserved.</p>
                    <form onSubmit={e=>{e.preventDefault(); void run();}} className="space-y-5">
                        <label className="block text-sm font-medium">Company email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="block w-full border border-zinc-300 rounded-xl px-4 py-3 mt-2 font-normal"/><span className="text-xs text-zinc-500 font-normal mt-2 block">Default demo sites: stripe.com, github.com, yusufsaka.dev</span></label>
                        <label className="block text-sm font-medium">Documentation question<textarea required minLength={3} maxLength={500} value={query} onChange={e=>setQuery(e.target.value)} className="block w-full border border-zinc-300 rounded-xl px-4 py-3 mt-2 h-24 font-normal"/></label>
                        <label className="block text-sm font-medium">Run through<select value={mode} onChange={e=>setMode(e.target.value)} className="block w-full border border-zinc-300 rounded-xl px-4 py-3 mt-2 font-normal"><option value="direct">Direct service pipeline</option><option value="n8n">n8n workflow</option></select></label>
                        <button disabled={loading} className="flex justify-center items-center gap-2 w-full rounded-xl bg-zinc-950 text-white py-3 font-medium disabled:opacity-50">{loading?<><Loader2 className="animate-spin" size={17}/> Running services…</>:<>Run preview <ArrowUpRight size={17}/></>}</button>
                    </form>
                </div>
                <div className="p-7 md:p-10 bg-zinc-950 text-white min-h-96" aria-live="polite">
                    <div className="flex gap-2 items-center text-zinc-400 text-xs uppercase tracking-widest"><Terminal size={15}/> Execution results</div>
                    {!result && <div className="mt-16"><Workflow size={42} className="text-emerald-400 mb-6"/><h3 className="text-2xl font-medium">Follow the evidence.</h3><p className="text-zinc-400 text-sm mt-4 leading-relaxed max-w-sm">Read a public company homepage, extract keyword signals, evaluate the routing rules, and retrieve a matching documentation entry.</p></div>}
                    {result && !result.success && <p className="mt-8 rounded-xl border border-red-800 bg-red-950 p-4 text-red-100">{result.error}</p>}
                    {result?.success && result.payload && <div className="mt-7 space-y-6">
                        <div className="flex gap-2 items-center text-emerald-400 text-sm"><CheckCircle2 size={17}/> Preview completed · {result.total_orchestration_ms} ms</div>
                        <div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-white/5 p-4"><span className="text-zinc-400 text-xs">Qualification score</span><div className="text-3xl mt-2">{result.payload.scoring_and_routing.final_icp_score}<span className="text-zinc-500 text-sm"> / 100</span></div></div><div className="rounded-xl bg-white/5 p-4"><span className="text-zinc-400 text-xs">Execution path</span><div className="text-xl mt-3">{result.orchestrator === "n8n" ? "n8n workflow" : "Direct"}</div></div></div>
                        <div className="space-y-3">{result.node_execution_trace?.map(step=><div key={step.name} className="flex justify-between border-b border-white/10 pb-3 text-sm"><span>{step.name}</span><span className="text-emerald-400">{step.duration_ms} ms</span></div>)}</div>
                        <p className="text-sm text-zinc-300">Next queue: <strong className="text-white">{result.payload.scoring_and_routing.qualification_tier}</strong><br/>Representative: {result.payload.scoring_and_routing.assigned_member.name}{result.payload.scoring_and_routing.sample_roster ? " (sample roster)" : ""}</p>
                        <p className="text-sm text-zinc-300">{result.payload.circuit_breaker.requires_hitl_approval ? result.payload.circuit_breaker.reasons.join(" · ") : "No review rule triggered. This preview takes no action."}</p>
                        <details className="text-sm"><summary className="cursor-pointer text-emerald-400">Read the documentation match</summary><p className="whitespace-pre-wrap mt-3 text-zinc-300 leading-relaxed">{result.payload.rag_deflection.direct_answer}</p></details>
                        {result.n8n_execution_id && <p className="text-xs text-zinc-400">n8n execution: {result.n8n_execution_id}</p>}
                        <details className="text-sm"><summary className="cursor-pointer text-zinc-400">Inspect full response</summary><pre className="text-xs overflow-auto max-h-80 mt-4 whitespace-pre-wrap break-all">{JSON.stringify(result,null,2)}</pre></details>
                    </div>}
                </div>
            </section>
            <section className="mt-14 grid md:grid-cols-2 gap-10 text-sm leading-relaxed">
                <div id="routing"><h2 className="text-xl font-semibold mb-3">What these results mean</h2><p className="text-zinc-600">Company size and technology signals are keyword-based estimates from the homepage. Routing uses deterministic rules: 85+ is enterprise, 65–84 is commercial, and lower scores go to self-service. The roster still includes sample representatives.</p><p className="mt-4 text-zinc-600">Documentation retrieval uses TF-IDF with keyword boosts. Its score measures relevance, not the probability that an answer is correct. Low matches are marked for human review.</p></div>
                <div><h2 className="text-xl font-semibold mb-3">What is running</h2><p className="text-zinc-600">Next.js coordinates a Rust crawler (Axum + Tokio with blocking HTML parsing offloaded via spawn_blocking), a Go router, and a Python documentation search. n8n wraps this preview in an authenticated webhook workflow. Authenticated customer capture, signed email delivery tracking, and pilot calendar booking live on separate workspace-scoped routes.</p><div className="flex flex-wrap gap-5 mt-5"><a href="/api/health" className="text-emerald-800 underline">Service health</a><Link href="/guide" className="text-emerald-800 underline">Usage guide</Link><a href="/workflows/polyglot-revenue-orchestrator.json" download className="text-emerald-800 underline">Preview workflow</a><a href="/workflows/customer-lead-capture.json" download className="text-emerald-800 underline">Customer capture workflow</a></div></div>
            </section>
            <section className="mt-12 grid md:grid-cols-2 gap-5">{[
                ["authentication", "Identity and workspaces", "Supabase handles user sign-in and workspace membership. Customer API routes bind workspaces strictly from server-side API keys. The Rust crawler uses a bearer token and server-created request extensions, never caller-supplied role headers."],
                ["booking", "Calendar handoff and pilot booking", "Workspaces store an HTTPS booking link for provider handoff. For the configured pilot workspace, /api/calendar/slots and /api/calendar/book read live Cal.com availability and confirm bookings for saved qualified leads."],
                ["events", "Durable capture and delivery", "POST /api/leads persists leads before dispatching email, enforces workspace-scoped Idempotency-Key replay/409 protection, and verifies signed Resend delivery callbacks stored in Supabase."],
                ["limits", "Security boundaries", "The public demonstration accepts a configured domain list and applies rate limits. The Rust crawler validates and pins public DNS/IPs, revalidates redirects, and bounds response bytes, concurrency, and fetch time."],
                ["rust-platform", "Rust platform and MCP tooling", "Built as a Cargo workspace with flowmeet-permissions (bitmask fast-paths, role hierarchy, tenant isolation), Prometheus /metrics + W3C traceparent, and flowmeet-agent-tools (CLI & stdio MCP server)."],
                ["self-host", "Docker, Helm and Kubernetes lab", "Production runs on Docker Compose with cargo-chef caching. An isolated kind + Calico CNI cluster also verified two non-root crawler replicas, NetworkPolicy egress isolation, failed-rollout detection, and Helm rollback."],
            ].map(([id,title,text])=><article id={id} key={id} className="rounded-2xl border border-zinc-200 bg-white p-6"><h2 className="font-semibold mb-2">{title}</h2><p className="text-sm text-zinc-600 leading-relaxed">{text}</p></article>)}</section>
            <footer className="mt-16 pt-7 border-t border-zinc-200 text-xs text-zinc-500">Flowmeet · Rust platform engineering in a working product.</footer>
        </div>
    </main>;
}
