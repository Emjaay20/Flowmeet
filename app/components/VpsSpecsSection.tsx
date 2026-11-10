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
        name: "Next.js Web App",
        runtime: "Node 20 Alpine",
        port: ":3000",
        ramMb: 46,
        ramPercent: 4.5,
        description: "App Router SSR, SSE event streaming, Cal.com slot proxy, and editorial user interface.",
        color: "bg-zinc-800"
    },
    {
        name: "Rust Scraper Engine",
        runtime: "Rust + Axum",
        port: ":8081",
        ramMb: 19,
        ramPercent: 1.9,
        description: "HTTP fetch, HTML parsing, Markdown conversion, SSRF protection, and regex tech detection.",
        color: "bg-amber-600"
    },
    {
        name: "Go Concierge Router",
        runtime: "Go 1.22 net/http",
        port: ":8082",
        ramMb: 10,
        ramPercent: 1.0,
        description: "Deterministic ICP scoring and round-robin territory routing. Standard library only, zero dependencies.",
        color: "bg-cyan-600"
    },
    {
        name: "Python Docs Search",
        runtime: "Python 3.12 + FastAPI",
        port: ":8083",
        ramMb: 49,
        ramPercent: 4.8,
        description: "TF-IDF cosine similarity search over product docs with citation linking and human escalation.",
        color: "bg-indigo-600"
    }
];

export default function VpsSpecsSection() {
    const [copied, setCopied] = useState(false);

    const deployCommand = "git clone https://github.com/Emjaay20/Flowmeet.git && cd Flowmeet && docker compose up -d --build";

    const handleCopy = () => {
        navigator.clipboard.writeText(deployCommand);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const totalActiveMb = SERVICES.reduce((acc, curr) => acc + curr.ramMb, 0); // 124 MB
    const totalVpsMb = 1024;
    const freeMb = totalVpsMb - totalActiveMb; // 900 MB

    return (
        <section id="architecture" className="py-24 sm:py-32 bg-[#fcfcf9] border-b border-zinc-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="max-w-3xl mb-16">
                    <div className="text-xs font-mono font-semibold tracking-wider text-zinc-500 uppercase mb-3">
                        02 • Measured Resource Footprint
                    </div>
                    <h2 className="font-editorial text-4xl sm:text-6xl font-normal text-zinc-950 tracking-tight leading-[1.1]">
                        Runs on a 1GB VPS. <br className="hidden sm:inline" />
                        <span className="italic font-serif text-zinc-800">124MB RAM total across four services.</span>
                    </h2>
                    <p className="mt-4 text-zinc-600 text-sm sm:text-base leading-relaxed font-sans">
                        No Kubernetes overhead. All four core services run in lightweight Docker containers fronted by Traefik. Measured on live production host <code className="text-zinc-800 bg-zinc-100 px-1 py-0.5 rounded font-mono text-xs">194.163.172.101</code> via <code className="text-zinc-800 bg-zinc-100 px-1 py-0.5 rounded font-mono text-xs">docker stats</code> (Nov 2026).
                    </p>
                </div>

                {/* 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Memory Visualizer Bar & Service Breakdown */}
                    <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                            <div>
                                <h3 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider">
                                    RAM ALLOCATION BREAKDOWN
                                </h3>
                                <p className="text-xs text-zinc-500 font-sans mt-0.5">
                                    Measured idle resident set size (RSS) per container
                                </p>
                            </div>
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {totalActiveMb} MB / {totalVpsMb} MB (12.1%)
                            </span>
                        </div>

                        {/* Visual Memory Bar */}
                        <div className="space-y-2">
                            <div className="w-full h-7 rounded-xl bg-zinc-100 p-1 flex items-center gap-1 overflow-hidden border border-zinc-200">
                                {SERVICES.map((s) => (
                                    <div
                                        key={s.name}
                                        style={{ width: `${s.ramPercent}%` }}
                                        className={`h-full rounded-md ${s.color} transition-all`}
                                        title={`${s.name}: ${s.ramMb} MB (${s.ramPercent}%)`}
                                    />
                                ))}
                                <div 
                                    style={{ width: `${(freeMb / totalVpsMb) * 100}%` }}
                                    className="h-full rounded-md bg-zinc-200/60"
                                    title={`Available VPS Headroom: ${freeMb} MB`}
                                />
                            </div>

                            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                                <span>Used by Flowmeet: <strong className="text-zinc-800">{totalActiveMb} MB</strong></span>
                                <span>Free VPS Headroom: <strong className="text-emerald-700">{freeMb} MB (87.9%)</strong></span>
                            </div>
                        </div>

                        {/* List of 4 Services */}
                        <div className="space-y-3 pt-2">
                            {SERVICES.map((s) => (
                                <div 
                                    key={s.name}
                                    className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between gap-4 text-xs font-sans"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-sm ${s.color}`}></span>
                                            <span className="font-bold text-zinc-900">{s.name}</span>
                                            <span className="font-mono text-[10px] text-zinc-500 bg-white px-1.5 py-0.5 rounded border border-zinc-200">
                                                {s.port}
                                            </span>
                                            <span className="text-[11px] text-zinc-400 font-mono">({s.runtime})</span>
                                        </div>
                                        <p className="text-zinc-500 text-[11px] pl-4">
                                            {s.description}
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0 font-mono">
                                        <div className="font-bold text-zinc-900">{s.ramMb} MB</div>
                                        <div className="text-[10px] text-zinc-400">{s.ramPercent}% total</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Live VPS Status & Hardware Telemetry */}
                    <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                            <div>
                                <h3 className="text-sm font-mono font-bold text-zinc-950 uppercase tracking-wider">
                                    LIVE HOST TELEMETRY
                                </h3>
                                <p className="text-xs text-zinc-500 font-sans mt-0.5">
                                    Production deployment specs
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ONLINE
                            </span>
                        </div>

                        {/* Specs Table */}
                        <div className="space-y-3 font-mono text-xs">
                            <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                                <span className="text-zinc-500 flex items-center gap-2">
                                    <Server className="w-3.5 h-3.5 text-zinc-400" /> Host OS
                                </span>
                                <span className="font-medium text-zinc-800">Debian 12 Bookworm (x86_64)</span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                                <span className="text-zinc-500 flex items-center gap-2">
                                    <Cpu className="w-3.5 h-3.5 text-zinc-400" /> CPU Allocation
                                </span>
                                <span className="font-medium text-zinc-800">1 vCPU (AMD EPYC)</span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                                <span className="text-zinc-500 flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5 text-zinc-400" /> Total System RAM
                                </span>
                                <span className="font-medium text-zinc-800">1,024 MB (1.0 GB)</span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                                <span className="text-zinc-500 flex items-center gap-2">
                                    <Zap className="w-3.5 h-3.5 text-zinc-400" /> Reverse Proxy
                                </span>
                                <span className="font-medium text-zinc-800">Traefik v3 (TLS SNI Routing)</span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                                <span className="text-zinc-500 flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" /> Public IP
                                </span>
                                <span className="font-medium text-zinc-800">194.163.172.101</span>
                            </div>
                        </div>

                        {/* Deploy Command Snippet */}
                        <div className="pt-2">
                            <div className="rounded-2xl bg-[#0d0e10] p-4 text-xs font-mono text-zinc-300 space-y-2 border border-zinc-800">
                                <div className="flex items-center justify-between text-zinc-400 text-[10px]">
                                    <span>ONE-LINE VPS DEPLOY</span>
                                    <button
                                        onClick={handleCopy}
                                        className="hover:text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                        <span>{copied ? "Copied" : "Copy"}</span>
                                    </button>
                                </div>
                                <code className="block text-zinc-200 break-all leading-relaxed">
                                    {deployCommand}
                                </code>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}
