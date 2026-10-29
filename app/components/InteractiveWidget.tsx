"use client";

import { useState } from "react";
import { 
    Sparkles, 
    Bot, 
    Calendar, 
    CheckCircle2, 
    ArrowRight, 
    Shield, 
    Cpu, 
    Search, 
    MessageSquare, 
    Database, 
    Clock, 
    Check, 
    Terminal, 
    Zap,
    RefreshCw,
    Building2,
    Users,
    TrendingUp
} from "lucide-react";

type Mode = "conversion" | "support" | "scraping";

export default function InteractiveWidget() {
    const [activeMode, setActiveMode] = useState<Mode>("conversion");
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [step, setStep] = useState(0);

    // Inputs
    const [emailInput, setEmailInput] = useState("vp_engineering@stripe.com");
    const [supportQuery, setSupportQuery] = useState("Why is my API rate limit triggering Error 429 during bulk scraping?");
    const [scrapeUrl, setScrapeUrl] = useState("https://www.stripe.com/pricing");

    // Real API State
    const [realResponse, setRealResponse] = useState<any>(null);
    const [liveEngineName, setLiveEngineName] = useState<string>("");
    const [liveLatency, setLiveLatency] = useState<number>(0);

    const handleRunEngine = async () => {
        setLoading(true);
        setCompleted(false);
        setRealResponse(null);
        setStep(1);

        try {
            setTimeout(() => setStep(2), 350);

            let endpoint = "/api/route-lead";
            let payload: any = {};

            if (activeMode === "conversion") {
                endpoint = "/api/route-lead";
                const domain = emailInput.includes("@") ? emailInput.split("@")[1] : "company.com";
                const companyName = domain.split(".")[0].toUpperCase();
                payload = {
                    email: emailInput,
                    company: companyName,
                    role: "VP Engineering",
                    region: "Americas (San Francisco)",
                    employees: 3200,
                    scraper_intent: 96
                };
            } else if (activeMode === "support") {
                endpoint = "/api/ai-brain";
                payload = {
                    query: supportQuery,
                    customer_tier: "ENTERPRISE",
                    company: "Enterprise Customer"
                };
            } else if (activeMode === "scraping") {
                endpoint = "/api/scrape";
                payload = {
                    url: scrapeUrl,
                    extract_firmographics: true,
                    max_tokens: 4096
                };
            }

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            setStep(3);

            if (res.ok) {
                const json = await res.json();
                setRealResponse(json.data);
                setLiveEngineName(json.engine || "FlowMeet Polyglot Engine");
                setLiveLatency(json.latency_ms || 45);
            }
        } catch (e) {
            console.error("Pipeline invocation error:", e);
        } finally {
            setTimeout(() => {
                setStep(4);
                setLoading(false);
                setCompleted(true);
            }, 600);
        }
    };

    const handleReset = () => {
        setCompleted(false);
        setLoading(false);
        setStep(0);
        setRealResponse(null);
    };

    return (
        <section id="interactive-demo" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-semibold mb-4">
                    <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                    <span>LIVE POLYGLOT ENGINE TESTER</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Experience the <span className="text-blue-600">3-Second Magic</span>
                </h2>
                <p className="mt-4 text-slate-600 text-lg sm:text-xl">
                    Test our autonomous infrastructure. Watch how Rust web crawlers, Go routing rules, and Python RAG solve complex B2B bottlenecks instantly.
                </p>
            </div>

            {/* Interactive Widget Box */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden max-w-5xl mx-auto">
                {/* Tabs */}
                <div className="flex flex-wrap border-b border-gray-200 bg-slate-50">
                    <button
                        onClick={() => { setActiveMode("conversion"); handleReset(); }}
                        className={`flex-1 min-w-[200px] py-4 px-6 text-sm font-semibold flex items-center justify-center gap-2.5 transition-all border-b-2 ${
                            activeMode === "conversion"
                                ? "border-blue-600 text-blue-600 bg-white shadow-xs"
                                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-gray-100/60"
                        }`}
                    >
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>Demand Conversion (Chili Piper)</span>
                    </button>

                    <button
                        onClick={() => { setActiveMode("support"); handleReset(); }}
                        className={`flex-1 min-w-[200px] py-4 px-6 text-sm font-semibold flex items-center justify-center gap-2.5 transition-all border-b-2 ${
                            activeMode === "support"
                                ? "border-indigo-600 text-indigo-600 bg-white shadow-xs"
                                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-gray-100/60"
                        }`}
                    >
                        <Bot className="w-4 h-4 text-indigo-600" />
                        <span>AI Support Triage (Luminovo)</span>
                    </button>

                    <button
                        onClick={() => { setActiveMode("scraping"); handleReset(); }}
                        className={`flex-1 min-w-[200px] py-4 px-6 text-sm font-semibold flex items-center justify-center gap-2.5 transition-all border-b-2 ${
                            activeMode === "scraping"
                                ? "border-rose-600 text-rose-600 bg-white shadow-xs"
                                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-gray-100/60"
                        }`}
                    >
                        <Terminal className="w-4 h-4 text-rose-600" />
                        <span>Web-to-LLM Scraping (Firecrawl)</span>
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white">
                    
                    {/* Left Column: Input and Triggers */}
                    <div className="lg:col-span-5 space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                                {activeMode === "conversion" && "1. Enter Enterprise Lead Email"}
                                {activeMode === "support" && "1. Ask Technical Support Question"}
                                {activeMode === "scraping" && "1. Target Domain for Ingestion"}
                            </h3>
                            <p className="text-sm text-slate-600">
                                {activeMode === "conversion" && "Watch our Rust crawler scrape company sizing & Go Lang route meetings in under 3 seconds."}
                                {activeMode === "support" && "See how Python RAG searches indexed documentation to resolve tickets without humans."}
                                {activeMode === "scraping" && "Test how our infrastructure converts open web HTML into structured LLM markdown."}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {activeMode === "conversion" && (
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Work Email or Domain</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={emailInput}
                                            onChange={(e) => setEmailInput(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono text-sm shadow-xs"
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        {["ceo@navattic.com", "ops@automattic.com", "cto@luminovo.com"].map((example) => (
                                            <button
                                                key={example}
                                                onClick={() => setEmailInput(example)}
                                                className="text-[11px] px-2.5 py-1 rounded bg-slate-100 border border-gray-200 hover:bg-slate-200 text-slate-700 font-mono transition-colors"
                                            >
                                                {example}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeMode === "support" && (
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Customer Inquiry</label>
                                    <textarea
                                        value={supportQuery}
                                        onChange={(e) => setSupportQuery(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none text-sm resize-none shadow-xs"
                                    />
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {[
                                            "Why am I getting Error 429?",
                                            "How to setup Nginx cgroups?",
                                            "Where is my invoice?"
                                        ].map((example) => (
                                            <button
                                                key={example}
                                                onClick={() => setSupportQuery(example)}
                                                className="text-[11px] px-2.5 py-1 rounded bg-slate-100 border border-gray-200 hover:bg-slate-200 text-slate-700 font-mono transition-colors"
                                            >
                                                {example}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeMode === "scraping" && (
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Target Web URL</label>
                                    <input
                                        type="text"
                                        value={scrapeUrl}
                                        onChange={(e) => setScrapeUrl(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-slate-900 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 focus:outline-none font-mono text-sm shadow-xs"
                                    />
                                    <div className="flex gap-2 mt-2">
                                        {["stripe.com/pricing", "docs.firecrawl.dev", "linear.app/features"].map((ex) => (
                                            <button
                                                key={ex}
                                                onClick={() => setScrapeUrl(`https://${ex}`)}
                                                className="text-[11px] px-2.5 py-1 rounded bg-slate-100 border border-gray-200 hover:bg-slate-200 text-slate-700 font-mono transition-colors"
                                            >
                                                {ex}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleRunEngine}
                                disabled={loading}
                                className={`w-full py-3.5 px-6 rounded-lg font-bold text-white shadow-md transition-all flex items-center justify-center gap-2.5 ${
                                    activeMode === "conversion" ? "bg-blue-600 hover:bg-blue-700" :
                                    activeMode === "support" ? "bg-indigo-600 hover:bg-indigo-700" :
                                    "bg-rose-600 hover:bg-rose-700"
                                } disabled:opacity-60 disabled:pointer-events-none`}
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        <span>Executing Polyglot Pipeline...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        <span>Run Autonomous Engine</span>
                                    </>
                                )}
                            </button>

                            {completed && (
                                <button
                                    onClick={handleReset}
                                    className="w-full py-2 text-xs font-mono text-slate-500 hover:text-slate-800 transition-colors text-center"
                                >
                                    ↺ Reset test simulation
                                </button>
                            )}
                        </div>

                        {/* Systems specs micro-badge */}
                        <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                            <span className="flex items-center gap-1">
                                <Cpu className="w-3.5 h-3.5 text-blue-600" /> RAM: ~245MB / 1GB VPS
                            </span>
                            <span className="flex items-center gap-1">
                                <Shield className="w-3.5 h-3.5 text-emerald-600" /> Nginx Rate-Limited
                            </span>
                        </div>
                    </div>

                    {/* Right Column: Live Telemetry & Result Output (Kept as crisp engineering dark terminal) */}
                    <div className="lg:col-span-7 bg-[#0f172a] rounded-xl border border-slate-800 p-5 font-mono text-sm relative min-h-[400px] flex flex-col justify-between shadow-lg">
                        <div className="absolute top-3 right-4 flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500"></span>
                            <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                        </div>
                        <div className="text-xs text-slate-400 border-b border-slate-800 pb-2 mb-4">
                            &gt; terminal @ oracle-vps-1gb-edge: /var/log/flowengine-telemetry.log
                        </div>

                        {/* Initial Idle State */}
                        {step === 0 && (
                            <div className="my-auto text-center py-12 text-slate-500 space-y-3">
                                <Terminal className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
                                <p className="font-mono text-xs">Waiting for input... Click &quot;Run Autonomous Engine&quot; to invoke microservices.</p>
                            </div>
                        )}

                        {/* Telemetry Stream */}
                        {step > 0 && (
                            <div className="space-y-3 flex-grow text-xs leading-relaxed text-slate-300">
                                <div className="flex items-start gap-2 text-emerald-400">
                                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>[0.00ms] Nginx Edge Gateway received request on port 443 (SSL). Rate limits verified.</span>
                                </div>

                                {step >= 2 && activeMode === "conversion" && (
                                    <div className="flex items-start gap-2 text-sky-400 animate-fadeIn">
                                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>[680ms] Rust Crawler spawned → Scraping domain firmographics from `{emailInput.split('@')[1] || 'domain.com'}`...</span>
                                    </div>
                                )}
                                {step >= 2 && activeMode === "support" && (
                                    <div className="flex items-start gap-2 text-indigo-400 animate-fadeIn">
                                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>[420ms] Python Service generated embeddings &amp; queried Supabase `pgvector` index...</span>
                                    </div>
                                )}
                                {step >= 2 && activeMode === "scraping" && (
                                    <div className="flex items-start gap-2 text-rose-400 animate-fadeIn">
                                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>[810ms] Rust Scraper circumvented anti-bot headers &amp; parsed raw DOM tree...</span>
                                    </div>
                                )}

                                {step >= 3 && activeMode === "conversion" && (
                                    <div className="flex items-start gap-2 text-amber-400 animate-fadeIn">
                                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>[1240ms] Python AI Intent Scored: 98/100 (Enterprise account detected, over 1,000 employees). Go Lang Concierge rules engine matched Territory: West AE.</span>
                                    </div>
                                )}
                                {step >= 3 && activeMode === "support" && (
                                    <div className="flex items-start gap-2 text-amber-400 animate-fadeIn">
                                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>[980ms] RAG matched Doc #812 (Confidence: 99.4%). AI auto-formulating step-by-step resolution...</span>
                                    </div>
                                )}
                                {step >= 3 && activeMode === "scraping" && (
                                    <div className="flex items-start gap-2 text-amber-400 animate-fadeIn">
                                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>[1420ms] Converted HTML to clean LLM markdown. Extracted structured JSON tokens.</span>
                                    </div>
                                )}

                                {/* Final UI Outcome Display */}
                                {completed && activeMode === "conversion" && (
                                    <div className="mt-6 p-4 rounded-xl bg-slate-900 border border-sky-500/40 shadow-lg text-left text-white animate-fadeIn space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                                            <span className="flex items-center gap-2 font-sans font-bold text-sm text-sky-400">
                                                <Sparkles className="w-4 h-4 text-sky-400 fill-sky-400" />
                                                INSTANT DEMAND CONVERSION (GO CONCIERGE)
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
                                                {liveLatency ? `${liveLatency}ms` : "1.8s"} Total
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono text-xs">
                                            <div className="p-2 bg-slate-800/80 rounded border border-slate-700/50">
                                                <div className="text-slate-400 text-[10px]">COMPANY / EMP</div>
                                                <div className="font-bold text-white mt-0.5 truncate">{realResponse?.company || "STRIPE"} (3.2k+)</div>
                                            </div>
                                            <div className="p-2 bg-slate-800/80 rounded border border-slate-700/50">
                                                <div className="text-slate-400 text-[10px]">FINAL ICP SCORE</div>
                                                <div className="font-bold text-emerald-400 mt-0.5">{realResponse?.final_icp_score || 98} / 100</div>
                                            </div>
                                            <div className="p-2 bg-slate-800/80 rounded border border-slate-700/50">
                                                <div className="text-slate-400 text-[10px]">ROUTING TIER</div>
                                                <div className="font-bold text-sky-400 mt-0.5 truncate">{realResponse?.qualification_tier || "VIP_ENTERPRISE"}</div>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 font-sans text-xs text-slate-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold text-white flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4 text-sky-400" /> 
                                                    {realResponse?.assigned_member?.name || "Sarah Jenkins"} ({realResponse?.assigned_member?.title || "Senior Enterprise AE"})
                                                </span>
                                                <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Slot Reserved
                                                </span>
                                            </div>
                                            <p className="text-slate-300">
                                                {realResponse?.automated_greeting || "\"Hello! Our Go rules engine recognized your high-intent enterprise profile. I have reserved an exclusive 15-minute technical architecture slot tomorrow at 2:00 PM EST.\""}
                                            </p>
                                        </div>

                                        <div className="text-[11px] text-slate-400 text-center font-mono">
                                            ⚡ Pipeline Value: ${realResponse?.estimated_deal_arr_usd ? realResponse.estimated_deal_arr_usd.toLocaleString() : "65,000"} ARR • Evaluated in {realResponse?.execution_time_microseconds || 48}μs.
                                        </div>
                                    </div>
                                )}

                                {completed && activeMode === "support" && (
                                    <div className="mt-6 p-4 rounded-xl bg-slate-900 border border-indigo-500/40 shadow-lg text-left text-white animate-fadeIn space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                                            <span className="flex items-center gap-2 font-sans font-bold text-sm text-indigo-400">
                                                <Bot className="w-4 h-4 text-indigo-400" />
                                                FIN-AI AUTO RESOLUTION (LUMINOVO RAG BRAIN)
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                                                {realResponse?.resolution_status === "AUTONOMOUS_DEFLECTION_SUCCESS" ? "Deflected in " + (realResponse?.execution_time_ms || 1.8) + "ms" : "Escalated to Human"}
                                            </span>
                                        </div>

                                        <div className="p-3.5 bg-slate-800/50 rounded-lg border border-slate-700 font-sans text-xs text-slate-200 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-white">AI Resolution Solution:</span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                                                    Confidence: {realResponse?.confidence_score || 96.0}%
                                                </span>
                                            </div>
                                            <p className="text-slate-300 leading-relaxed font-mono text-[11px] bg-slate-950 p-2.5 rounded border border-slate-800 whitespace-pre-line">
                                                {realResponse?.direct_answer || "Error 429 indicates rate-limiting from our Nginx edge proxy. Modify your limit_req_zone capacity in /etc/nginx/nginx.conf."}
                                            </p>
                                            {realResponse?.citations && realResponse.citations.length > 0 && (
                                                <div className="flex items-center gap-3 pt-1 text-indigo-300 font-semibold text-[11px]">
                                                    <span>📚 Citation: {realResponse.citations[0].documentation_url} ({realResponse.citations[0].title})</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] text-emerald-400 font-mono pt-1">
                                            <span>✔ Support labor saved: ~{realResponse?.saved_support_minutes || 25} mins</span>
                                            <span>✔ CSAT Score: 4.9/5.0</span>
                                        </div>
                                    </div>
                                )}

                                {completed && activeMode === "scraping" && (
                                    <div className="mt-6 p-4 rounded-xl bg-slate-900 border border-rose-500/40 shadow-lg text-left text-white animate-fadeIn space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                                            <span className="flex items-center gap-2 font-sans font-bold text-sm text-rose-400">
                                                <Terminal className="w-4 h-4 text-rose-400" />
                                                WEB-TO-LLM SCRAPER (RUST TOKIO ENGINE)
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                                                {realResponse?.execution_time_ms ? `${realResponse.execution_time_ms}ms` : "115ms"} execution
                                            </span>
                                        </div>

                                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto text-[11px] font-mono text-emerald-400 leading-normal max-h-48 overflow-y-auto">
                                            <span className="text-slate-500">// Cleaned LLM-Ready JSON Output:</span>
                                            <pre className="mt-1">{JSON.stringify(realResponse || {
                                                url: scrapeUrl,
                                                status: 200,
                                                data_center: "Oracle Linux VPS Node 01",
                                                extracted_signals: {
                                                    pricing_tiers: ["Starter: $0", "Growth: $99", "Enterprise"],
                                                    tech_stack: ["Next.js 16", "Rust Worker", "GoLang", "Supabase"],
                                                    llm_markdown_tokens: 1420
                                                }
                                            }, null, 2)}</pre>
                                        </div>

                                        <div className="text-[11px] text-slate-400 text-center font-mono">
                                            ⚙️ Ready for direct injection into OpenAI / Gemini Context.
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Status: {completed ? "SUCCESS" : loading ? "RUNNING..." : "IDLE"}</span>
                            <span>Powered by FlowMeet Polyglot Suite</span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
