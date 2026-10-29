import { Shield, Server, Cpu, Zap, Database, Terminal, GitMerge, Layers, Code2, Network } from "lucide-react";

export default function ArchitectureSection() {
    const pillars = [
        {
            title: "Automattic Systems & Edge Layer",
            subtitle: "Senior Systems & DevOps Resilience",
            badge: "Nginx • Linux Cgroups • SRE",
            badgeColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
            icon: <Server className="w-6 h-6 text-emerald-600" />,
            borderColor: "hover:border-emerald-500",
            description: "Built for tens of billions of requests. Our Nginx edge proxy provides micro-caching, SSL termination, and rate-limiting zones (DDoS defense). Tuned with explicit Linux kernel memory quotas (cgroups) to operate blazingly fast on lightweight VPS hosts without OOM faults.",
            highlights: ["0.8ms Edge Gateway routing", "1GB RAM VPS optimized footprint (~245MB used)", "Automated self-healing recovery"]
        },
        {
            title: "Firecrawl Search & Scraping Infra",
            subtitle: "Web-to-LLM Data Engineering",
            badge: "Rust • Proxy Pools • pgvector",
            badgeColor: "text-rose-700 bg-rose-50 border-rose-200",
            icon: <Terminal className="w-6 h-6 text-rose-600" />,
            borderColor: "hover:border-rose-500",
            description: "Turn the open web into actionable AI data in under 3 seconds. Our high-throughput Rust workers crawl company websites to enrich inbound leads in real time, converting messy adversarial HTML into pristine LLM-ready markdown and indexing documentation for instant RAG search.",
            highlights: ["Real-time lead firmographic enrichment", "Clean Markdown extraction for LLM ingestion", "Spiky traffic handling & proxy rotation"]
        },
        {
            title: "Chili Piper Demand Conversion Engine",
            subtitle: "High-Concurrency Sales Scheduling",
            badge: "GoLang • Transformers.js • WSS",
            badgeColor: "text-blue-700 bg-blue-50 border-blue-200",
            icon: <Zap className="w-6 h-6 text-blue-600 fill-blue-600/20" />,
            borderColor: "hover:border-blue-500",
            description: "No more passive web forms or 48-hour SDR delays. Powered by a GoLang routing engine with sub-50ms rule evaluation, high-intent enterprise buyers are qualified instantaneously, matching territory ownership and locking in meetings on Account Executive calendars in under 5 seconds.",
            highlights: ["Instantaneous ICP Lead scoring (0-100)", "Client-side Edge AI via WebAssembly", "Zero human lag -> 70% conversion lift"]
        },
        {
            title: "Luminovo Enablement & Support Brain",
            subtitle: "RevOps Triage & FinAI Self-Service",
            badge: "Python RAG • Intercom • Analytics",
            badgeColor: "text-indigo-700 bg-indigo-50 border-indigo-200",
            icon: <Layers className="w-6 h-6 text-indigo-600" />,
            borderColor: "hover:border-indigo-500",
            description: "The ultimate gluework between Sales, Customer Success, and Product teams. When users submit technical troubles, our Python RAG assistant acts as an automated FinAI specialist—retrieving docs to resolve 85%+ of tickets autonomously and surfacing critical GTM telemetry.",
            highlights: ["85% automated support ticket deflection", "Real-time CSAT & Time-to-Close KPIs", "Unified bridge between Product & Customer"]
        }
    ];

    return (
        <section id="architecture" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-semibold mb-4">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>PRODUCTION POLYGLOT MICROSERVICES</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Engineered for the <span className="text-blue-600">Frontier of Tech</span>
                </h2>
                <p className="mt-4 text-slate-600 text-lg sm:text-xl">
                    We don&apos;t build basic monoliths. FlowMeet unites four industry-defining engineering paradigms into one unshakeable, enterprise-ready infrastructure architecture.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {pillars.map((pillar, idx) => (
                    <div
                        key={idx}
                        className={`bg-white p-8 rounded-2xl border border-gray-200 transition-all duration-300 ${pillar.borderColor} hover:shadow-lg flex flex-col justify-between group shadow-xs`}
                    >
                        <div>
                            <div className="flex items-center justify-between gap-4 mb-5">
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-gray-200 group-hover:bg-slate-100 transition-colors">
                                    {pillar.icon}
                                </div>
                                <span className={`text-xs font-mono px-3 py-1 rounded-full border font-semibold ${pillar.badgeColor}`}>
                                    {pillar.badge}
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {pillar.title}
                            </h3>
                            <div className="text-sm font-semibold text-slate-500 mb-3 font-mono">
                                // {pillar.subtitle}
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                {pillar.description}
                            </p>
                        </div>

                        <div className="pt-5 border-t border-gray-100 space-y-2">
                            {pillar.highlights.map((item, i) => (
                                <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700 font-mono">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Microservice Architecture Banner */}
            <div className="mt-16 bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-6 shadow-xl">
                <div className="space-y-1">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <Network className="w-5 h-5 text-blue-400" />
                        Zero-Cost Hosting Architecture
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                        Frontend on Vercel • Database on Supabase Free • Microservices on Oracle 1GB VPS (245MB RAM load)
                    </p>
                </div>
                <a
                    href="/docs"
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold transition-all shadow-xs"
                >
                    View Architecture Spec →
                </a>
            </div>
        </section>
    );
}
