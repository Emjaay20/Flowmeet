"use client";

import { useState } from "react";
import { Check, ArrowRight, Sparkles, Shield, HelpCircle } from "lucide-react";

export default function PricingSection() {
    const [apiKeyGenerated, setApiKeyGenerated] = useState(false);
    const [demoRequested, setDemoRequested] = useState(false);

    const handleApiKeyModal = () => {
        setApiKeyGenerated(true);
        setTimeout(() => setApiKeyGenerated(false), 3500);
    };

    return (
        <section id="pricing" className="py-24 sm:py-32 bg-[#fcfcf9] border-b border-zinc-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-mono font-medium mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-950"></span>
                        <span>PRICING &amp; REVENUE MODEL</span>
                    </div>
                    <h2 className="font-editorial text-4xl sm:text-6xl font-normal text-zinc-950 tracking-tight leading-[1.1]">
                        Start free. Pay when we <br className="hidden sm:inline" />
                        <span className="italic font-serif text-zinc-800">book revenue, not promises.</span>
                    </h2>
                    <p className="mt-4 text-zinc-600 text-sm sm:text-base leading-relaxed font-sans max-w-xl mx-auto">
                        No predatory annual lock-ins. Switch between ultra-low-cost raw API calls or performance-based demo fees where we only get paid when qualified buyers show up.
                    </p>
                </div>

                {/* 3 Pricing Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-7xl mx-auto">
                    
                    {/* Tier 1: Usage-Based API */}
                    <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-8 flex flex-col justify-between hover:border-zinc-400 transition-all">
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
                                <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
                                    DEVELOPER TIER
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-[10px] font-mono text-zinc-600 font-semibold border border-zinc-200">
                                    Self-Service
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold text-zinc-950 font-sans tracking-tight mb-2">
                                Usage-Based API
                            </h3>
                            <p className="text-xs text-zinc-500 font-sans mb-6">
                                For engineering teams integrating low-latency scraping and deterministic routing into existing web forms.
                            </p>

                            <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-zinc-100">
                                <span className="text-4xl font-extrabold text-zinc-950 font-sans tracking-tight">$0.008</span>
                                <span className="text-xs font-mono text-zinc-500">/ enrichment call</span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {[
                                    "2,500 free requests / month",
                                    "Sub-3s Rust web scraping endpoint",
                                    "Sub-50ms Go territory routing webhook",
                                    "OpenAPI JSON & Swagger schema docs",
                                    "Community Discord & async GitHub support"
                                ].map((feature) => (
                                    <li key={feature} className="flex items-start gap-2.5 text-xs text-zinc-700 font-sans">
                                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={handleApiKeyModal}
                                className="w-full py-3 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-sans font-bold text-xs tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer border border-zinc-300"
                            >
                                <span>{apiKeyGenerated ? "Key Generated: fm_live_9921... ✓" : "Generate Live API Key"}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <p className="text-[10px] font-mono text-zinc-400 text-center mt-2.5">
                                Instant access • No card required
                            </p>
                        </div>
                    </div>

                    {/* Tier 2: Success-Fee RevOps (Highlighted / Best Value) */}
                    <div className="bg-zinc-950 text-white rounded-3xl border-2 border-zinc-900 shadow-xl p-8 flex flex-col justify-between relative lg:-translate-y-2">
                        {/* Top Best Value Banner */}
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#c8f944] text-zinc-950 font-mono text-[10px] font-bold tracking-wider uppercase shadow-sm">
                            ★ BEST VALUE • REVOPS ACCELERATOR
                        </div>

                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6 pt-2">
                                <span className="text-xs font-mono font-bold text-[#c8f944] uppercase tracking-wider">
                                    PERFORMANCE MODEL
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-[10px] font-mono text-zinc-300 font-semibold border border-zinc-700">
                                    Zero Subscription
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold text-white font-sans tracking-tight mb-2">
                                Success-Fee RevOps
                            </h3>
                            <p className="text-xs text-zinc-400 font-sans mb-6">
                                For high-growth B2B teams replacing manual SDR qualification and $25k/yr enterprise meeting schedulers.
                            </p>

                            <div className="flex items-baseline gap-1.5 mb-6 pb-6 border-b border-zinc-800">
                                <span className="text-4xl font-extrabold text-[#c8f944] font-sans tracking-tight">$75 - $150</span>
                                <span className="text-xs font-mono text-zinc-400">/ qualified attended demo</span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {[
                                    "$0 monthly platform fee — pay strictly on results",
                                    "Verified attendance guarantee (no-shows billed at $0)",
                                    "Custom Go territory routing & weighted round-robin",
                                    "Cal.com instant in-session booking embed",
                                    "Live Slack channel alerts & HubSpot two-way sync",
                                    "Autonomous tier-1 support deflection with Python RAG"
                                ].map((feature) => (
                                    <li key={feature} className="flex items-start gap-2.5 text-xs text-zinc-200 font-sans">
                                        <Check className="w-4 h-4 text-[#c8f944] flex-shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <a
                                href="#interactive-demo"
                                className="w-full py-3.5 rounded-full bg-[#c8f944] hover:bg-[#bbf32d] text-zinc-950 font-sans font-bold text-sm tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                            >
                                <span>Deploy Inbound Pilot</span>
                                <ArrowRight className="w-4 h-4 text-zinc-950" />
                            </a>
                            <p className="text-[10px] font-mono text-zinc-400 text-center mt-2.5">
                                14-day zero-risk trial • Attended demo guarantee
                            </p>
                        </div>
                    </div>

                    {/* Tier 3: White-Label Agency */}
                    <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-8 flex flex-col justify-between hover:border-zinc-400 transition-all">
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
                                <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
                                    AGENCY &amp; ENTERPRISE
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-[10px] font-mono text-zinc-600 font-semibold border border-zinc-200">
                                    White-Label
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold text-zinc-950 font-sans tracking-tight mb-2">
                                White-Label Agency
                            </h3>
                            <p className="text-xs text-zinc-500 font-sans mb-6">
                                For growth agencies and consultancies deploying automated conversion pipelines under their own brand.
                            </p>

                            <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-zinc-100">
                                <span className="text-4xl font-extrabold text-zinc-950 font-sans tracking-tight">$499</span>
                                <span className="text-xs font-mono text-zinc-500">/ month flat</span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {[
                                    "Unlimited client sub-accounts & domains",
                                    "Complete brand removal & custom domain URLs",
                                    "Turnkey VPS Docker container deployment script",
                                    "Full source code access for internal customization",
                                    "Multi-tenant webhook dispatcher & Zapier bridges",
                                    "Direct async engineering channel with core maintainers"
                                ].map((feature) => (
                                    <li key={feature} className="flex items-start gap-2.5 text-xs text-zinc-700 font-sans">
                                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <a
                                href="#contact"
                                className="w-full py-3 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-sans font-bold text-xs tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>Book Agency Walkthrough</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                            <p className="text-[10px] font-mono text-zinc-400 text-center mt-2.5">
                                Custom SLAs available • Cancel anytime
                            </p>
                        </div>
                    </div>

                </div>

                {/* Bottom Trust Line */}
                <div className="mt-12 pt-8 border-t border-zinc-200 max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-zinc-500">
                    <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> 30-Day Performance Guarantee
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Zero Hidden Infrastructure Surcharges
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Cancel Anytime with 1 Click
                    </span>
                </div>

            </div>
        </section>
    );
}
