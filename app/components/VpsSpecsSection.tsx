import Link from "next/link";
import { Activity, ArrowUpRight, Box } from "lucide-react";
const services = [
    ["Next.js gateway", "Website, API, and workspace dashboard", "384 MiB"],
    ["Rust crawler", "Authenticated fetching and signal extraction", "128 MiB"],
    ["Go router", "Deterministic scoring and territory rules", "64 MiB"],
    ["Python retrieval", "Documentation search with citations", "128 MiB"],
    ["n8n workflow", "Authenticated preview orchestration", "768 MiB"],
];
export default function VpsSpecsSection() {
    return <section id="architecture" className="py-24 bg-[#fcfcf9] border-b border-zinc-200"><div className="max-w-7xl mx-auto px-6">
        <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4">02 · The platform underneath</div>
        <div className="grid lg:grid-cols-2 gap-14 items-start"><div><h2 className="font-editorial text-4xl sm:text-6xl tracking-tight">Small services.<br/><span className="italic">Visible boundaries.</span></h2><p className="mt-6 text-zinc-600 leading-relaxed max-w-lg">Five containers with explicit resource budgets. The gateway is public; the crawler, routing service, and documentation search stay on a private application network.</p><div className="mt-8 p-6 bg-white rounded-2xl border border-zinc-200"><Activity className="text-emerald-700 mb-4" size={23}/><h3 className="font-semibold">Inspect the running system</h3><p className="text-sm text-zinc-600 mt-2 leading-relaxed">Health checks report current dependency availability. The preview shows measured request timings. Resource limits shown here are configured ceilings, not live memory readings.</p><div className="flex gap-6 mt-5 text-sm font-medium"><a href="/api/health" className="inline-flex items-center gap-1 text-emerald-800">Service health <ArrowUpRight size={14}/></a><Link href="/docs" className="inline-flex items-center gap-1">Run a preview <ArrowUpRight size={14}/></Link></div></div></div><div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8"><div className="flex items-center justify-between text-xs uppercase tracking-wider text-zinc-500 pb-5"><span className="flex gap-2 items-center"><Box size={15}/> Service</span><span>Memory limit</span></div>{services.map(([name,description,limit])=><div key={name} className="flex justify-between items-center gap-4 py-5 border-t border-zinc-100"><div><div className="font-semibold text-sm">{name}</div><p className="text-xs text-zinc-500 mt-1">{description}</p></div><span className="font-mono text-sm whitespace-nowrap">{limit}</span></div>)}<p className="text-xs text-zinc-500 mt-4 leading-relaxed">Rust fetching is limited to four concurrent requests, a 2 MiB response, three redirects, and a ten-second fetch deadline.</p></div></div>
    </div></section>;
}
