"use client";

import { useState } from "react";
import { Terminal, Cpu, Zap, Calendar, Check, ArrowRight, ShieldCheck, Copy } from "lucide-react";

interface StepCard {
    number: string;
    latency: string;
    latencyType: "fast" | "instant" | "edge";
    title: string;
    subtitle: string;
    endpoint: string;
    description: string;
    codeSnippet: string;
    tags: string[];
}

const STEPS: StepCard[] = [
    {
        number: "01",
        latency: "245ms avg",
        latencyType: "fast",
        title: "Rust Scraper",
        subtitle: "Adversarial HTML → Clean Markdown",
        endpoint: "POST /api/scrape",
        description: "Strikes the prospect root domain, bypasses anti-bot defenses, extracts raw HTML, and compiles token-dense LLM markdown with zero headless browser overhead.",
        codeSnippet: `// Rust actix-web worker (:8081)
POST /api/scrape
{
  "domain": "stripe.com",
  "bytes_read": 142800,
  "clean_markdown_len": 4120,
  "memory_rss_mb": 17.2,
  "status": "ready_for_llm"
}`,
        tags: ["Rust 1.78", "reqwest", "html2md", "17MB RAM"]
    },
    {
        number: "02",
        latency: "14ms edge",
        latencyType: "edge",
        title: "Go Concierge",
        subtitle: "Sub-50ms ICP & Territory Rules",
        endpoint: "POST /api/route-lead",
        description: "Evaluates multi-condition firmographic routing in microseconds. Computes ICP score, employee count threshold, and selects the exact AE via weighted round-robin.",
        codeSnippet: `// Go Gin microservice (:8082)
POST /api/route-lead
{
  "icp_score": 94,
  "matched_tier": "Enterprise Tier 1",
  "territory": "EMEA_NORTH",
  "assigned_rep": "elena.r@flowmeet.io",
  "eval_time_us": 410
}`,
        tags: ["Go 1.22", "Gin", "Round-Robin", "13MB RAM"]
    },
    {
        number: "03",
        latency: "0ms instant",
        latencyType: "instant",
        title: "Cal.com Native",
        subtitle: "Zero-Redirect In-Session Handoff",
        endpoint: "POST /api/cal/slots",
        description: "Eliminates the 48-hour SDR dropoff. Directly hooks into Cal.com API with rep pre-assignment, injecting live booking slots straight inside the user's current session.",
        codeSnippet: `// Cal.com Native API Handoff
POST /api/cal/slots
{
  "rep_id": "usr_9912",
  "timezone": "Europe/London",
  "slots_available": 3,
  "dropoff_risk": "0.00%",
  "instant_reserve": true
}`,
        tags: ["Cal.com API", "Webhooks", "Zero Dropoff", "Next.js"]
    },
    {
        number: "04",
        latency: "410ms RAG",
        latencyType: "fast",
        title: "Python RAG Brain",
        subtitle: "Luminovo-Style FinAI Deflection",
        endpoint: "POST /api/ai-brain",
        description: "Autonomous technical enablement engine. Matches inbound questions against vector embeddings to answer docs inquiries and escalates qualified leads instantly.",
        codeSnippet: `// Python FastAPI + pgvector (:8083)
POST /api/ai-brain
{
  "query_type": "technical_vetting",
  "confidence": 0.982,
  "support_deflected": true,
  "action": "route_to_ae_calendar",
  "embedding_dim": 1536
}`,
        tags: ["FastAPI", "pgvector", "LangChain", "62MB RAM"]
    }
];

export default function FourStepsSection() {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (snippet: string, index: number) => {
        navigator.clipboard.writeText(snippet);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <section id="how-it-works" className="py-24 sm:py-32 bg-[#fcfcf9] border-b border-zinc-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-mono font-medium mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-900"></span>
                            <span>HOW IT WORKS • 4-STEP VERIFIABLE PIPELINE</span>
                        </div>
                        <h2 className="font-editorial text-4xl sm:text-6xl font-normal text-zinc-950 tracking-tight leading-[1.1]">
                            From anonymous visitor <br className="hidden sm:inline" />
                            to booked revenue in <span className="italic font-serif text-zinc-800">four verifiable steps.</span>
                        </h2>
                    </div>
                    <div className="max-w-md">
                        <p className="text-zinc-600 text-sm sm:text-base leading-relaxed font-sans">
                            Every single step emits structured JSON telemetry with microsecond timestamps. Built to replace opaque enterprise tools with deterministic edge speed.
                        </p>
                    </div>
                </div>

                {/* 4 Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {STEPS.map((step, idx) => (
                        <div 
                            key={step.number}
                            className="flex flex-col justify-between bg-white rounded-2xl border border-zinc-200/90 shadow-sm hover:shadow-md hover:border-zinc-400/80 transition-all duration-200 p-6 relative group"
                        >
                            {/* Card Top: Number & Latency Badge */}
                            <div>
                                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4">
                                    <span className="font-editorial text-2xl font-normal text-zinc-400 group-hover:text-zinc-950 transition-colors">
                                        {step.number}
                                    </span>
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium ${
                                        step.latencyType === "instant" 
                                            ? "bg-[#c8f944]/30 text-zinc-950 border border-[#c8f944]"
                                            : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                            step.latencyType === "instant" ? "bg-zinc-950 animate-pulse" : "bg-emerald-500"
                                        }`}></span>
                                        <span>{step.latency}</span>
                                    </div>
                                </div>

                                {/* Step Title & Subtitle */}
                                <h3 className="text-xl font-bold text-zinc-950 font-sans tracking-tight mb-1">
                                    {step.title}
                                </h3>
                                <p className="text-xs font-mono text-zinc-500 mb-3">
                                    {step.subtitle}
                                </p>
                                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-sans mb-5">
                                    {step.description}
                                </p>
                            </div>

                            {/* Card Bottom: Dark Terminal Code Box */}
                            <div>
                                <div className="relative rounded-xl bg-zinc-950 p-3.5 border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-hidden group/code">
                                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-2">
                                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                                            {step.endpoint}
                                        </span>
                                        <button 
                                            onClick={() => handleCopy(step.codeSnippet, idx)}
                                            className="text-zinc-400 hover:text-white transition-colors"
                                            title="Copy telemetry snippet"
                                        >
                                            {copiedIndex === idx ? (
                                                <Check className="w-3.5 h-3.5 text-[#c8f944]" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5 opacity-60 group-hover/code:opacity-100 transition-opacity" />
                                            )}
                                        </button>
                                    </div>
                                    <pre className="overflow-x-auto text-[10px] leading-relaxed text-zinc-300 font-mono scrollbar-thin">
                                        <code>{step.codeSnippet}</code>
                                    </pre>
                                </div>

                                {/* Tech Tags */}
                                <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-zinc-100">
                                    {step.tags.map((tag) => (
                                        <span 
                                            key={tag}
                                            className="px-2 py-0.5 rounded bg-zinc-50 text-[10px] font-mono text-zinc-600 border border-zinc-200"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Verifiable Architecture Note */}
                <div className="mt-12 p-4 rounded-xl bg-zinc-100/80 border border-zinc-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-zinc-900 text-[#c8f944]">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-700 font-sans">
                            <strong className="font-semibold text-zinc-950">Deterministic Pipeline:</strong> All microservices are strictly decoupled into single-responsibility isolated containers. Zero monolithic latency spikes.
                        </p>
                    </div>
                    <a 
                        href="/docs" 
                        className="text-xs font-mono font-semibold text-zinc-900 hover:text-zinc-600 flex items-center gap-1.5 whitespace-nowrap"
                    >
                        <span>View OpenAPI &amp; Architecture Specs</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                </div>

            </div>
        </section>
    );
}
