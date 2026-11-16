import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
const steps = [
    ["01", "Read the company website", "Rust · Axum · Tokio", "Fetch a public homepage, convert HTML to text, and extract technology and enterprise keywords. Each resolved address and redirect is checked before connecting."],
    ["02", "Choose a next step", "Go · deterministic rules", "Use the observed signals and supplied lead details to calculate a rough qualification score and select an enterprise, commercial, or self-service queue."],
    ["03", "Find a documented answer", "Python · TF-IDF retrieval", "Match a technical question to an existing documentation entry and its citation. Weak matches are marked for human review rather than answered confidently."],
    ["04", "Review before acting", "n8n · authenticated workflow", "Inspect the measured result directly or through n8n. The preview sends no emails and creates no meetings. Booking and customer delivery are separate integrations."],
];
export default function FourStepsSection() {
    return <section id="how-it-works" className="py-24 bg-white border-b border-zinc-200"><div className="max-w-7xl mx-auto px-6"><div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4">01 · How it works</div><div className="flex flex-wrap gap-6 justify-between items-end"><h2 className="font-editorial text-4xl sm:text-6xl tracking-tight">A useful signal.<br/><span className="italic">An explainable decision.</span></h2><Link href="/docs" className="text-sm font-medium flex items-center gap-2">Try the full preview <ArrowUpRight size={16}/></Link></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">{steps.map(([n,title,subtitle,text])=><article key={n} className="rounded-2xl border border-zinc-200 p-6"><span className="text-emerald-700 font-mono text-sm">{n}</span><h3 className="text-lg font-semibold mt-7">{title}</h3><p className="text-xs text-zinc-500 mt-2">{subtitle}</p><p className="text-sm text-zinc-600 leading-relaxed mt-5">{text}</p></article>)}</div></div></section>;
}
