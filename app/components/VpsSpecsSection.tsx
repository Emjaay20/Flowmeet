"use client";

import { useState } from "react";
import { 
    Cpu, 
    Server, 
    Terminal, 
    HardDrive, 
    ShieldCheck, 
    Copy, 
    Check, 
    ExternalLink, 
    Zap,
    Activity
} from "lucide-react";

interface ServiceMetric {
    name: string;
    runtime: string;
    port: string;
    ramMb: number;
    ramPercent: number;
    description: string;
    color: string;
}

const SERVICES: ServiceMetric[] = [
    {
        name: "Next.js App Router",
        runtime: "Node 20 Alpine",
        port: ":3000",
        ramMb: 38,
        ramPercent: 3.7,
        description: "Edge SSR, SSE live event streaming, Cal.com dynamic slot client, and responsive editorial layout.",
        color: "bg-zinc-800"
    },
    {
        name: "Rust Scraper Engine",
        runtime: "Rust Actix-Web",
        port: ":8081",
        ramMb: 17,
        ramPercent: 1.6,
        description: "Zero-Chromium DOM parser, anti-bot stream synthesis, token-dense markdown generator in native binary.",
        color: "bg-amber-600"
    },
    {
        name: "Go Concierge Router",
        runtime: "Go 1.22 Gin",
        port: ":8082",
        ramMb: 13,
        ramPercent: 1.3,
        description: "Microsecond territory evaluation, employee count bands, weighted round-robin AE assignment dispatcher.",
        color: "bg-cyan-600"
    },
    {
        name: "Python RAG Brain",
        runtime: "FastAPI + pgvector",
        port: ":8083",
        ramMb: 62,
        ramPercent: 6.1,
        description: "Vector embeddings, technical documentation QA triage, automated high-intent sales ticket deflection.",
        color: "bg-indigo-600"
    }
];

export default function VpsSpecsSection() {
    const [copied, setCopied] = useState(false);

    const deployCommand = "git clone https://github.com/aetherhost/flowmeet.git && cd flowmeet && docker compose up -d";

    const handleCopy = () => {
        navigator.clipboard.writeText(deployCommand);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const totalActiveMb = SERVICES.reduce((acc, curr) => acc + curr.ramMb, 0); // 130 MB
    const totalVpsMb = 1024;
    const freeMb = totalVpsMb - totalActiveMb; // 894 MB

    return (
        <section id="architecture" className="py-24 sm:py-32 bg-[#fcfcf9] border-b border-zinc-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="max-w-3xl mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-mono font-medium mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-950"></span>
                        <span>SYSTEM ARCHITECTURE • ZERO VENDOR LOCK-IN</span>
                    </div>
                    <h2 className="font-editorial text-4xl sm:text-6xl font-normal text-zinc-950 tracking-tight leading-[1.1]">
                        Runs on a 1GB Oracle VPS. <br className="hidden sm:inline" />
                        <span className="italic font-serif text-zinc-800">Yours to deploy in 10 minutes.</span>
                    </h2>
                    <p className="mt-4 text-zinc-600 text-sm sm:text-base leading-relaxed font-sans">
                        No bloated Kubernetes clusters. No $500/month AWS bills. Four hyper-efficient microservices orchestrated via Docker Compose and fronted by Traefik with automated wildcard TLS.
                    </p>
                </div>

                {/* 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    
                    {/* Left: 4 Microservice Tiles */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {SERVICES.map((srv) => (
                                <div 
                                    key={srv.name}
                                    className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-sm hover:border-zinc-400 transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-3">
                                            <span className="text-xs font-mono font-bold text-zinc-900">
                                                {srv.name}
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-zinc-100 text-[10px] font-mono text-zinc-600 border border-zinc-200">
                                                {srv.port}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-600 font-sans leading-relaxed mb-4">
                                            {srv.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-mono pt-3 border-t border-zinc-100">
                                        <span className="text-zinc-500">{srv.runtime}</span>
                                        <span className="font-bold text-zinc-950">{srv.ramMb} MB RAM</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Node Specs Pill Card */}
                        <div className="p-4 rounded-2xl bg-zinc-100 border border-zinc-200 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                            <div className="flex items-center gap-3">
                                <Server className="w-4 h-4 text-zinc-700" />
                                <span className="text-zinc-700">Host: <strong>Oracle Cloud Free-Tier (A1.Flex)</strong></span>
                            </div>
                            <div className="flex items-center gap-4 text-zinc-600">
                                <span>1 vCPU</span>
                                <span>•</span>
                                <span>1,024 MB RAM</span>
                                <span>•</span>
                                <span className="text-emerald-700 font-bold">12.7% Total Load</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: RAM Metrics Breakdown & Deploy Terminal */}
                    <div className="lg:col-span-5 bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
                        
                        <div>
                            {/* Metric Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-zinc-950" />
                                    <h3 className="text-xs font-mono font-bold text-zinc-950 uppercase tracking-wider">
                                        MEMORY BREAKDOWN (1024MB CEILING)
                                    </h3>
                                </div>
                                <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                                    {totalActiveMb}MB Active
                                </span>
                            </div>

                            {/* Stacked Memory Visual Bar */}
                            <div className="mb-6">
                                <div className="h-4 w-full bg-zinc-100 rounded-full overflow-hidden flex p-0.5 border border-zinc-200">
                                    <div style={{ width: `${(38 / 1024) * 100}%` }} className="bg-zinc-800 h-full rounded-l-full" title="Next.js: 38MB" />
                                    <div style={{ width: `${(17 / 1024) * 100}%` }} className="bg-amber-500 h-full" title="Rust: 17MB" />
                                    <div style={{ width: `${(13 / 1024) * 100}%` }} className="bg-cyan-500 h-full" title="Go: 13MB" />
                                    <div style={{ width: `${(62 / 1024) * 100}%` }} className="bg-indigo-600 h-full" title="Python: 62MB" />
                                    <div style={{ width: `${(freeMb / 1024) * 100}%` }} className="bg-zinc-200 h-full rounded-r-full" title="Free: 894MB" />
                                </div>

                                <div className="flex justify-between text-[10px] font-mono text-zinc-400 mt-2">
                                    <span>0 MB</span>
                                    <span>130 MB Used (12.7%)</span>
                                    <span>1024 MB Total</span>
                                </div>
                            </div>

                            {/* Individual Metric Breakdown Rows */}
                            <div className="space-y-2.5 mb-8">
                                {SERVICES.map((s) => (
                                    <div key={s.name} className="flex items-center justify-between text-xs font-mono">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2.5 h-2.5 rounded-xs ${s.color}`}></span>
                                            <span className="text-zinc-700">{s.name}</span>
                                        </div>
                                        <span className="font-semibold text-zinc-950">{s.ramMb} MB</span>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-zinc-100 text-zinc-500">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-xs bg-zinc-300"></span>
                                        <span>Free Headroom Available</span>
                                    </div>
                                    <span className="font-bold text-emerald-700">{freeMb} MB (87.3%)</span>
                                </div>
                            </div>
                        </div>

                        {/* Deploy Command Snippet */}
                        <div className="rounded-2xl bg-zinc-950 text-white p-4 border border-zinc-800">
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[10px] font-mono text-zinc-400">
                                <span>DEPLOY LOCALLY OR ON VPS</span>
                                <button 
                                    onClick={handleCopy}
                                    className="flex items-center gap-1 text-[#c8f944] hover:text-white transition-colors cursor-pointer"
                                >
                                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    <span>{copied ? "Copied" : "Copy"}</span>
                                </button>
                            </div>
                            <pre className="text-[11px] font-mono text-zinc-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                <code>{deployCommand}</code>
                            </pre>
                            <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                                <span className="flex items-center gap-1.5 text-emerald-400">
                                    <ShieldCheck className="w-3 h-3" /> Traefik SSL Managed
                                </span>
                                <span>Ready in &lt; 2 minutes</span>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}
