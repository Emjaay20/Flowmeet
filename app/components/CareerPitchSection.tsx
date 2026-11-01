"use client";

import { useState } from "react";
import { 
    CheckCircle2, 
    Layers, 
    ArrowRight, 
    Sparkles, 
    Cpu, 
    Shield, 
    Zap, 
    GitBranch, 
    UserCheck,
    Check,
    RefreshCw,
    Sliders,
    Building2,
    Users
} from "lucide-react";

type TeamType = "firecrawl" | "chilipiper" | "luminovo";

interface PitchContent {
    id: TeamType;
    teamName: string;
    roleFocus: string;
    headline: string;
    bullets: string[];
    interviewPrompt: string;
    interviewAnswer: string;
    techPills: string[];
}

const PITCHES: Record<TeamType, PitchContent> = {
    firecrawl: {
        id: "firecrawl",
        teamName: "Firecrawl",
        roleFocus: "Web Scraping Infra & High-Throughput Engines",
        headline: "Adversarial HTML → Clean LLM Markdown with 0 Browser Overhead",
        bullets: [
            "Bypasses bot protections using adaptive header synthesis and low-level HTTP stream parsing in Rust.",
            "Strikes raw DOM nodes and extracts semantic body text without spinning up heavy Chromium headless instances.",
            "Strict memory containment via cgroups: 245MB RAM peak ceiling on an ultra-lightweight 1GB VPS node.",
            "Eliminates memory leaks and GC latency spikes for deterministic continuous 24/7 web ingestion."
        ],
        interviewPrompt: "Ask me: How did you design a web scraper in Rust that beats browser-based extractors on 1/10th the memory footprint?",
        interviewAnswer: "By compiling html2md into an Actix-Web worker with streaming reqwest pipelines, Flowmeet strips JavaScript clutter and outputs token-dense markdown directly into memory at 245ms average roundtrip.",
        techPills: ["Rust 1.78", "Actix-Web", "reqwest", "html2md", "cgroups containment", "Zero-Chromium"]
    },
    chilipiper: {
        id: "chilipiper",
        teamName: "Chili Piper",
        roleFocus: "Inbound Conversion & Sub-50ms Routing Concierge",
        headline: "Sub-50ms Territory Rules & Cal.com Native In-Session Booking",
        bullets: [
            "Evaluates complex nested firmographic criteria (territory, employee bands, CRM account ownership) in Go in under 20ms.",
            "Weighted round-robin dispatcher ensures fair rep distribution without external database transaction locks.",
            "Zero-redirect booking handoff: eliminates the 48-hour SDR dropoff by embedding Cal.com slots directly in the visitor session.",
            "Edge ICP qualification gates AE calendars, defending senior reps from unqualified support and student inquiries."
        ],
        interviewPrompt: "Ask me: How does Flowmeet match Chili Piper Form Concierge while cutting calendar drop-off to near zero?",
        interviewAnswer: "We pre-qualify the prospect in-flight during the form fill, assign the exact rep via a compiled Go microservice, and inject Cal.com slots dynamically before the visitor can navigate away.",
        techPills: ["Go 1.22", "Gin Web Framework", "Cal.com API", "Weighted Round-Robin", "Edge ICP Gate", "Sub-50ms Eval"]
    },
    luminovo: {
        id: "luminovo",
        teamName: "Luminovo",
        roleFocus: "Technical Product Enablement & Autonomous Triage",
        headline: "Vector RAG Support Deflection + Sales Pipeline Bridge",
        bullets: [
            "Luminovo-style FinAI triage engine that reads customer technical documentation and provides instant answers to complex queries.",
            "pgvector semantic embeddings classify visitor intent into high-intent revenue leads vs. tier-1 documentation lookups.",
            "Deflects up to 43% of inbound repetitive support load while automatically elevating enterprise procurement signals.",
            "Unified RevOps telemetry stream syncing qualification vectors directly to HubSpot, Salesforce, and Slack webhooks."
        ],
        interviewPrompt: "Ask me: How did you bridge support deflection and inbound sales qualification using pgvector RAG?",
        interviewAnswer: "Flowmeet runs a FastAPI RAG brain on port 8083 that performs cosine similarity searches over company documentation. It answers technical inquiries autonomously and triggers sales routing when high-intent buying signals are detected.",
        techPills: ["Python 3.11", "FastAPI", "Supabase pgvector", "LangChain / OpenAI", "Intent Classification", "RevOps Telemetry"]
    }
};

export default function CareerPitchSection() {
    const [activeTeam, setActiveTeam] = useState<TeamType>("firecrawl");

    // Interactive Rule Builder State (Chili Piper showcase)
    const [selectedRegion, setSelectedRegion] = useState<"EMEA" | "NA" | "APAC">("EMEA");
    const [selectedEmployees, setSelectedEmployees] = useState<">50" | ">200" | ">1000">(">200");
    const [selectedTech, setSelectedTech] = useState<string[]>(["Salesforce", "Stripe"]);
    const [evaluating, setEvaluating] = useState(false);
    const [evalLatency, setEvalLatency] = useState("14ms");
    const [assignedRep, setAssignedRep] = useState({
        name: "Elena Rostova",
        role: "Enterprise AE (EMEA North)",
        email: "elena.r@flowmeet.io",
        avatar: "ER"
    });

    const toggleTech = (tech: string) => {
        if (selectedTech.includes(tech)) {
            setSelectedTech(selectedTech.filter(t => t !== tech));
        } else {
            setSelectedTech([...selectedTech, tech]);
        }
    };

    const handleEvaluateRule = () => {
        setEvaluating(true);
        setTimeout(() => {
            setEvaluating(false);
            const randomLatency = Math.floor(Math.random() * 8 + 11) + "ms";
            setEvalLatency(randomLatency);
            if (selectedRegion === "EMEA") {
                setAssignedRep({
                    name: "Elena Rostova",
                    role: "Enterprise AE (EMEA North)",
                    email: "elena.r@flowmeet.io",
                    avatar: "ER"
                });
            } else if (selectedRegion === "NA") {
                setAssignedRep({
                    name: "Marcus Vance",
                    role: "Strategic Accounts (NA West)",
                    email: "marcus.v@flowmeet.io",
                    avatar: "MV"
                });
            } else {
                setAssignedRep({
                    name: "Siddharth Menon",
                    role: "Regional Director (APAC)",
                    email: "sid.m@flowmeet.io",
                    avatar: "SM"
                });
            }
        }, 350);
    };

    const pitch = PITCHES[activeTeam];

    return (
        <section id="career-matrix" className="py-24 sm:py-32 bg-[#fcfcf9] border-b border-zinc-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Eyebrow */}
                <div className="max-w-3xl mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-mono font-medium mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c8f944]"></span>
                        <span>CAREER PITCH &amp; ARCHITECTURE MATRIX</span>
                    </div>
                    <h2 className="font-editorial text-4xl sm:text-6xl font-normal text-zinc-950 tracking-tight leading-[1.1]">
                        Engineered for 3 teams. <br className="hidden sm:inline" />
                        <span className="italic font-serif text-zinc-800">Irresistible for your next hire.</span>
                    </h2>
                    <p className="mt-4 text-zinc-600 text-sm sm:text-base leading-relaxed font-sans">
                        Rather than building another generic mock SaaS, Flowmeet was deliberately engineered around the production challenges of top-tier infrastructure, revenue, and AI enablement teams.
                    </p>
                </div>

                {/* 2-Column Grid: Recruiter Matrix (Left) & Live Rule Builder (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Interactive Pitch Tabs & Content */}
                    <div className="lg:col-span-7 bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
                        
                        {/* Tab Switcher */}
                        <div>
                            <div className="flex flex-wrap gap-2 pb-6 border-b border-zinc-100 mb-6">
                                {(["firecrawl", "chilipiper", "luminovo"] as TeamType[]).map((teamKey) => {
                                    const item = PITCHES[teamKey];
                                    const isActive = activeTeam === teamKey;
                                    return (
                                        <button
                                            key={teamKey}
                                            onClick={() => setActiveTeam(teamKey)}
                                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-sans font-semibold tracking-tight transition-all cursor-pointer flex items-center gap-2 ${
                                                isActive
                                                    ? "bg-zinc-950 text-white shadow-xs"
                                                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-950"
                                            }`}
                                        >
                                            <span className={`w-2 h-2 rounded-full ${
                                                isActive ? "bg-[#c8f944]" : "bg-zinc-400"
                                            }`}></span>
                                            <span>{item.teamName}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Active Content Header */}
                            <div className="mb-6">
                                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
                                    {pitch.roleFocus}
                                </span>
                                <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 font-sans tracking-tight leading-snug">
                                    {pitch.headline}
                                </h3>
                            </div>

                            {/* Bullet Points */}
                            <ul className="space-y-3 mb-8">
                                {pitch.bullets.map((bullet, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-600 leading-relaxed font-sans">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <span>{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Interview Talk Track Callout Box */}
                        <div className="space-y-4">
                            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 text-white border border-zinc-800">
                                <div className="flex items-center gap-2 text-[11px] font-mono text-[#c8f944] uppercase tracking-wider mb-2">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Recruiter Talk Track</span>
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-zinc-100 font-sans italic mb-2">
                                    &ldquo;{pitch.interviewPrompt}&rdquo;
                                </p>
                                <p className="text-[11px] sm:text-xs text-zinc-400 font-sans leading-relaxed border-t border-zinc-800/80 pt-2">
                                    {pitch.interviewAnswer}
                                </p>
                            </div>

                            {/* Tech Stack Pills */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-2">
                                <span className="text-[10px] font-mono text-zinc-400 mr-1 uppercase">Stack:</span>
                                {pitch.techPills.map((tech) => (
                                    <span 
                                        key={tech} 
                                        className="px-2.5 py-1 rounded-full bg-zinc-100 text-[11px] font-mono font-medium text-zinc-700 border border-zinc-200"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Live Interactive Routing Rules Builder (Chili Piper Mode) */}
                    <div className="lg:col-span-5 bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 sm:p-8">
                        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
                            <div className="flex items-center gap-2">
                                <Sliders className="w-4 h-4 text-zinc-900" />
                                <span className="text-xs font-mono font-bold text-zinc-950 uppercase tracking-wider">
                                    LIVE ROUTING RULES BUILDER
                                </span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-[#c8f944]/40 text-zinc-950 font-mono text-[10px] font-bold border border-[#c8f944]">
                                Chili Piper Mode
                            </span>
                        </div>

                        <p className="text-xs text-zinc-500 font-sans mb-6">
                            Test how compiled Go rules evaluate incoming lead firmographics and calculate rep allocation in under 20 milliseconds.
                        </p>

                        {/* Condition 1: Region */}
                        <div className="space-y-2 mb-5">
                            <label className="text-[11px] font-mono text-zinc-700 uppercase font-semibold flex items-center gap-1.5">
                                <span className="text-zinc-400">01.</span> IF Prospect Region EQUALS
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {(["EMEA", "NA", "APAC"] as const).map((region) => (
                                    <button
                                        key={region}
                                        type="button"
                                        onClick={() => setSelectedRegion(region)}
                                        className={`py-2 px-3 rounded-xl text-xs font-mono font-medium border transition-all cursor-pointer ${
                                            selectedRegion === region
                                                ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                                                : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                                        }`}
                                    >
                                        {region}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Condition 2: Employee Count */}
                        <div className="space-y-2 mb-5">
                            <label className="text-[11px] font-mono text-zinc-700 uppercase font-semibold flex items-center gap-1.5">
                                <span className="text-zinc-400">02.</span> AND Employee Headcount IS
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {( [">50", ">200", ">1000"] as const).map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => setSelectedEmployees(size)}
                                        className={`py-2 px-3 rounded-xl text-xs font-mono font-medium border transition-all cursor-pointer ${
                                            selectedEmployees === size
                                                ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                                                : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Condition 3: Tech Stack Flags */}
                        <div className="space-y-2 mb-6">
                            <label className="text-[11px] font-mono text-zinc-700 uppercase font-semibold flex items-center gap-1.5">
                                <span className="text-zinc-400">03.</span> AND Tech Stack Signals INCLUDE
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {["Salesforce", "Stripe", "AWS", "Snowflake", "HubSpot"].map((tech) => {
                                    const isSelected = selectedTech.includes(tech);
                                    return (
                                        <button
                                            key={tech}
                                            type="button"
                                            onClick={() => toggleTech(tech)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                                                isSelected
                                                    ? "bg-zinc-900 text-[#c8f944] font-semibold border border-zinc-900"
                                                    : "bg-zinc-50 text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
                                            }`}
                                        >
                                            {isSelected && <Check className="w-3 h-3 text-[#c8f944]" />}
                                            <span>{tech}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Action Box: Rep Assigned */}
                        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 mb-6">
                            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-3 pb-2 border-b border-zinc-200">
                                <span>THEN ROUTE &amp; ASSIGN AE</span>
                                <span className="text-emerald-700 font-bold">{evalLatency} eval</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-950 text-[#c8f944] font-bold font-mono flex items-center justify-center text-sm flex-shrink-0">
                                    {assignedRep.avatar}
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="text-sm font-bold text-zinc-950 font-sans truncate">
                                        {assignedRep.name}
                                    </h4>
                                    <p className="text-xs text-zinc-600 font-sans truncate">
                                        {assignedRep.role}
                                    </p>
                                    <p className="text-[11px] font-mono text-zinc-500 truncate">
                                        {assignedRep.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Evaluate Button */}
                        <button
                            type="button"
                            onClick={handleEvaluateRule}
                            disabled={evaluating}
                            className="w-full py-3 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-sans font-bold text-xs sm:text-sm tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                        >
                            {evaluating ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin text-[#c8f944]" />
                                    <span>Compiling Rule in Go...</span>
                                </>
                            ) : (
                                <>
                                    <span>Run Microsecond Evaluation</span>
                                    <ArrowRight className="w-4 h-4 text-[#c8f944]" />
                                </>
                            )}
                        </button>

                    </div>

                </div>

            </div>
        </section>
    );
}
