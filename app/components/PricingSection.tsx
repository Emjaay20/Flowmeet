"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, GitBranch, Server, Terminal, Shield, ArrowRight } from "lucide-react";

export default function PricingSection() {
    const [copied, setCopied] = useState(false);

    const composeSnippet = `# 1. Clone the repository
git clone https://github.com/Emjaay20/Flowmeet.git
cd Flowmeet

# 2. Configure environment variables
cp .env.example .env

# 3. Spin up the polyglot stack
docker compose up -d --build`;

    const handleCopy = () => {
        navigator.clipboard.writeText(composeSnippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section id="pricing" className="py-24 sm:py-32 bg-[#fcfcf9] border-b border-zinc-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-mono font-medium mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-950"></span>
                        <span>SELF-HOSTED &amp; OPEN ARCHITECTURE</span>
                    </div>
                    <h2 className="font-editorial text-4xl sm:text-6xl font-normal text-zinc-950 tracking-tight leading-[1.1]">
                        Deploy Flowmeet on your own server. <br className="hidden sm:inline" />
                        <span className="italic font-serif text-zinc-800">No per-seat pricing. Zero vendor lock-in.</span>
                    </h2>
                    <p className="mt-4 text-zinc-600 text-sm sm:text-base leading-relaxed font-sans max-w-2xl mx-auto">
                        Commercial inbound routing tools charge thousands of dollars per month with annual seat contracts. Flowmeet runs on a single $4–$5/month VPS (1GB RAM) with four lightweight containers and complete control over your data.
                    </p>
                </div>

                {/* Quickstart + Architecture Specs Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
                    
                    {/* Left: Quickstart Terminal */}
                    <div className="lg:col-span-7 bg-[#0d0e10] rounded-3xl border border-zinc-800 p-6 sm:p-8 flex flex-col justify-between shadow-xl text-white">
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                                    <span className="text-[11px] font-mono text-zinc-400 ml-2">quickstart.sh</span>
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <p className="text-xs text-zinc-400 font-mono mb-4">
                                # Requirements: Docker 24+, Docker Compose v2, 1GB RAM minimum
                            </p>

                            <pre className="font-mono text-xs text-zinc-200 leading-relaxed overflow-x-auto p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 mb-6">
                                <code>{composeSnippet}</code>
                            </pre>

                            <div className="space-y-3 pt-2">
                                {[
                                    { label: "Zero database bloat", detail: "In-memory LRU cache and Go router execute without database blocking on the critical path." },
                                    { label: "Traefik with automatic TLS", detail: "Handles Let's Encrypt certificates and reverse-proxies all four services." },
                                    { label: "Cal.com & Firecrawl integration", detail: "Works with Cal.com free tier and Firecrawl API for complex SPA enrichment." }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                                        <Check className="w-4 h-4 text-[#c8f944] flex-shrink-0 mt-0.5" />
                                        <span>
                                            <strong className="text-white font-medium">{item.label}:</strong> {item.detail}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center gap-3">
                            <a
                                href="https://github.com/Emjaay20/Flowmeet"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#c8f944] hover:bg-[#bbf32d] text-zinc-950 font-bold text-xs tracking-tight transition-all flex items-center justify-center gap-2"
                            >
                                <GitBranch className="w-3.5 h-3.5" />
                                <span>Star on GitHub</span>
                            </a>
                            <a
                                href="/docs"
                                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs tracking-tight transition-all flex items-center justify-center gap-2"
                            >
                                <span>Read Engineering Docs</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>

                    {/* Right: Transparent VPS Cost Breakdown */}
                    <div className="lg:col-span-5 bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
                                <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
                                    ESTIMATED MONTHLY COST
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[10px] font-mono text-emerald-700 font-semibold border border-emerald-200">
                                    Self-Hosted
                                </span>
                            </div>

                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-4xl font-extrabold text-zinc-950 font-sans tracking-tight">~$5</span>
                                <span className="text-xs font-mono text-zinc-500">/ month total</span>
                            </div>
                            <p className="text-xs text-zinc-500 mb-6">
                                Compared to $1,500–$3,500/mo for proprietary inbound routing suites.
                            </p>

                            <div className="space-y-3 pb-6 border-b border-zinc-100 font-mono text-xs">
                                <div className="flex items-center justify-between py-1.5 border-b border-zinc-50">
                                    <span className="text-zinc-600">Hetzner / Oracle Cloud VPS (1GB)</span>
                                    <span className="font-semibold text-zinc-900">$4.50</span>
                                </div>
                                <div className="flex items-center justify-between py-1.5 border-b border-zinc-50">
                                    <span className="text-zinc-600">Flowmeet Core Microservices</span>
                                    <span className="font-semibold text-emerald-600">$0.00 (Open Source)</span>
                                </div>
                                <div className="flex items-center justify-between py-1.5 border-b border-zinc-50">
                                    <span className="text-zinc-600">Cal.com Scheduling</span>
                                    <span className="font-semibold text-zinc-900">Free Tier</span>
                                </div>
                                <div className="flex items-center justify-between py-1.5 border-b border-zinc-50">
                                    <span className="text-zinc-600">Firecrawl API (Optional Fallback)</span>
                                    <span className="font-semibold text-zinc-900">Free Credits</span>
                                </div>
                                <div className="flex items-center justify-between pt-2 text-zinc-900 font-bold">
                                    <span>Total Infrastructure Run Cost</span>
                                    <span className="text-emerald-700">~$4.50 / mo</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-1.5 text-zinc-600">
                                <p className="font-semibold text-zinc-900 flex items-center gap-1.5">
                                    <Server className="w-3.5 h-3.5 text-zinc-700" />
                                    Production Host Specs
                                </p>
                                <p className="text-[11px] leading-relaxed">
                                    Currently deployed on a 1-core, 1GB RAM Debian host at <code className="text-zinc-800 bg-white px-1 py-0.5 rounded border border-zinc-200">194.163.172.101</code> using only ~124MB RAM under idle and ~140MB under active scraping load.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}
