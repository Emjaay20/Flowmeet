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
        latency: "~400–600ms",
        latencyType: "fast",
        title: "Rust Crawler",
        subtitle: "HTML → Markdown & Tech Signals",
        endpoint: "POST /api/scrape",
        description: "Fetches the company's homepage over plain HTTP, parses the HTML, and converts it to Markdown. Extracts tech-stack and compliance keywords with exact regex boundaries. No headless browser.",
        codeSnippet: `// Rust + Axum worker (:8081)
POST /api/scrape
{
  "domain": "stripe.com",
  "bytes_read": 142800,
  "clean_markdown_len": 4120,
  "detected_tech": ["Next.js", "Stripe", "PostgreSQL"],
  "memory_rss_mb": 19.4,
  "status": "ready_for_routing"
}`,
        tags: ["Rust", "Axum", "reqwest", "html2md", "~19MB RAM"]
    },
    {
        number: "02",
        latency: "<50µs CPU",
        latencyType: "edge",
        title: "Go Concierge",
        subtitle: "ICP score and territory rules",
        endpoint: "POST /api/route-lead",
        description: "Scores the lead from its firmographics, then assigns a tier and an account executive by score threshold and region. Standard library only, with no database queries in the request path.",
        codeSnippet: `// Go net/http service (:8082)
POST /api/route-lead
{
  "icp_score": 94,
  "matched_tier": "Enterprise Tier 1",
  "territory": "EMEA_NORTH",
  "assigned_rep": "elena.r@flowmeet.io",
  "execution_time_ns": 8200
}`,
        tags: ["Go 1.22", "net/http", "Standard Library", "~10MB RAM"]
    },
    {
        number: "03",
        latency: "Instant",
        latencyType: "instant",
        title: "Cal.com Native",
        subtitle: "In-Session Calendar Handoff",
        endpoint: "POST /api/book-slot",
        description: "Eliminates the multi-day SDR follow-up dropoff. Generates RFC 5545 calendar invitations and direct Cal.com booking links immediately after qualification.",
        codeSnippet: `// Cal.com Native API Handoff
POST /api/book-slot
{
  "rep": "Elena Rostova",
  "timezone": "Europe/London",
  "slot": "Tomorrow 10:00 AM",
  "cal_link": "https://cal.com/flowmeet/demo",
  "rfc5545_ics_generated": true
}`,
        tags: ["Cal.com API", "RFC 5545 ICS", "Zero Dropoff", "Next.js"]
    },
    {
        number: "04",
        latency: "<10ms",
        latencyType: "fast",
        title: "Python Docs Search",
        subtitle: "TF-IDF retrieval and ticket deflection",
        endpoint: "POST /api/ai-brain",
        description: "Matches incoming buyer technical questions against indexed product docs using TF-IDF cosine similarity. Returns relevant excerpts with citations; escalates low-confidence queries to an AE.",
        codeSnippet: `// Python 3.12 + FastAPI (:8083)
POST /api/ai-brain
{
  "query": "How do you handle SOC 2 compliance?",
  "match_score": 82.4,
  "matched_doc": "security-and-compliance",
  "deflected": true,
  "retrieval": "tf_idf_cosine"
}`,
        tags: ["Python 3.12", "FastAPI", "TF-IDF Cosine", "~49MB RAM"]
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
                
                {/* Header */}
                <div className="max-w-3xl mb-16">
                    <div className="text-xs font-mono font-semibold tracking-wider text-zinc-500 uppercase mb-3">
                        01 • Pipeline Architecture
                    </div>
                    <h2 className="font-editorial text-4xl sm:text-6xl font-normal text-zinc-950 tracking-tight leading-[1.1]">
                        Four purpose-built steps. <br className="hidden sm:inline" />
                        <span className="italic font-serif text-zinc-800">Measured in milliseconds, not promises.</span>
                    </h2>
                    <p className="mt-4 text-zinc-600 text-sm sm:text-base leading-relaxed font-sans">
                        Each microservice handles a single responsibility. Rust fetches and extracts DOM structure, Go computes qualification and territory rules in microseconds, Next.js hands off to Cal.com, and Python searches technical documentation.
                    </p>
                </div>

                {/* 4 Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {STEPS.map((step, idx) => (
                        <div 
                            key={step.number}
                            className="bg-white rounded-2xl border border-zinc-200/90 shadow-sm p-6 flex flex-col justify-between hover:border-zinc-400 transition-all group"
                        >
                            <div>
                                {/* Step Top Row: Number & Measured Latency */}
                                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
                                    <span className="font-editorial text-2xl font-normal text-zinc-400 group-hover:text-zinc-950 transition-colors">
                                        {step.number}
                                    </span>
                                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-md font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                                        {step.latency}
                                    </span>
                                </div>

                                {/* Step Title */}
                                <h3 className="text-lg font-bold text-zinc-950 font-sans tracking-tight mb-1">
                                    {step.title}
                                </h3>
                                <div className="text-xs font-mono text-zinc-500 mb-3">
                                    {step.subtitle}
                                </div>

                                <p className="text-xs text-zinc-600 leading-relaxed font-sans mb-5">
                                    {step.description}
                                </p>
                            </div>

                            {/* Code Snippet Box */}
                            <div>
                                <div className="relative rounded-xl bg-[#0e1012] border border-zinc-800/90 p-3 mb-4 text-[11px] font-mono text-zinc-300">
                                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[10px] text-zinc-500">
                                        <span>{step.endpoint}</span>
                                        <button
                                            onClick={() => handleCopy(step.codeSnippet, idx)}
                                            className="hover:text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
                                        >
                                            {copiedIndex === idx ? (
                                                <Check className="w-3 h-3 text-emerald-400" />
                                            ) : (
                                                <Copy className="w-3 h-3" />
                                            )}
                                        </button>
                                    </div>
                                    <pre className="mt-2 overflow-x-auto text-zinc-300">
                                        <code>{step.codeSnippet}</code>
                                    </pre>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-100">
                                    {step.tags.map((t) => (
                                        <span 
                                            key={t}
                                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600"
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
