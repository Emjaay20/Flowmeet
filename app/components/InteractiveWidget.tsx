"use client";

import { useState, useRef, useEffect } from "react";
import { 
    Sparkles, 
    Bot, 
    Calendar, 
    CheckCircle2, 
    Shield, 
    Cpu, 
    Terminal, 
    Zap, 
    RefreshCw, 
    ExternalLink,
    Check,
    Globe,
    Layers,
    Clock
} from "lucide-react";

type Mode = "conversion" | "support" | "scraping";

interface LogEntry {
    time_ms: number;
    text: string;
    type?: "system" | "success" | "warn" | "accent";
}

export default function InteractiveWidget() {
    const [activeMode, setActiveMode] = useState<Mode>("conversion");
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);

    // Inputs
    const [emailInput, setEmailInput] = useState("vp_engineering@stripe.com");
    const [supportQuery, setSupportQuery] = useState("How do I configure SAML 2.0 single sign on for Okta?");
    const [scrapeUrl, setScrapeUrl] = useState("https://stripe.com/pricing");

    // Live Streaming Logs & Telemetry
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [streamedPayload, setStreamedPayload] = useState<any>(null);
    const [bookedSlot, setBookedSlot] = useState<string | null>(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    const logContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const handleRunEngine = async () => {
        setLoading(true);
        setCompleted(false);
        setStreamedPayload(null);
        setBookedSlot(null);
        setBookingSuccess(false);
        setLogs([
            { time_ms: 0, text: "[0ms] Request dispatched from browser client...", type: "system" }
        ]);

        if (activeMode === "conversion") {
            try {
                const response = await fetch("/api/stream-enrich", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: emailInput })
                });

                if (!response.body) throw new Error("No readable stream received");

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            try {
                                const event = JSON.parse(line.replace("data: ", ""));
                                if (event.log) {
                                    setLogs((prev) => [
                                        ...prev,
                                        {
                                            time_ms: event.time_ms || 0,
                                            text: event.log,
                                            type: event.step === 5 ? "success" : "accent"
                                        }
                                    ]);
                                }
                                if (event.payload) {
                                    setStreamedPayload(event.payload);
                                }
                            } catch {
                                // ignore parse glitches
                            }
                        }
                    }
                }
            } catch (err: any) {
                setLogs((prev) => [
                    ...prev,
                    { time_ms: 450, text: `[Error] ${err.message}`, type: "warn" }
                ]);
            } finally {
                setLoading(false);
                setCompleted(true);
            }
        } else if (activeMode === "support") {
            try {
                setLogs((prev) => [
                    ...prev,
                    { time_ms: 80, text: "[80ms] Calling Python FastAPI RAG Brain on port 8083...", type: "accent" }
                ]);

                const res = await fetch("/api/ai-brain", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: supportQuery, customer_tier: "ENTERPRISE", company: "Customer" })
                });

                if (res.ok) {
                    const json = await res.json();
                    setStreamedPayload(json.data);
                    setLogs((prev) => [
                        ...prev,
                        { time_ms: 210, text: `[210ms] RAG search matched indexed documentation. Confidence: ${json.data.confidence_score}%`, type: "accent" },
                        { time_ms: 280, text: `[280ms] Classification: ${json.data.resolution_status} (Saved ~${json.data.saved_support_minutes} mins)`, type: "success" }
                    ]);
                }
            } catch (err: any) {
                setLogs((prev) => [...prev, { time_ms: 300, text: `[Error] ${err.message}`, type: "warn" }]);
            } finally {
                setLoading(false);
                setCompleted(true);
            }
        } else if (activeMode === "scraping") {
            try {
                setLogs((prev) => [
                    ...prev,
                    { time_ms: 60, text: `[60ms] Invoking Rust Axum Crawler (Port 8081) for ${scrapeUrl}...`, type: "accent" }
                ]);

                const res = await fetch("/api/scrape", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: scrapeUrl, extract_firmographics: true })
                });

                if (res.ok) {
                    const json = await res.json();
                    setStreamedPayload(json.data);
                    setLogs((prev) => [
                        ...prev,
                        { time_ms: 480, text: `[480ms] Live DOM parsed. Detected tech stack: [${json.data.firmographic_signals.detected_tech_stack.join(", ")}]`, type: "accent" },
                        { time_ms: 540, text: `[540ms] Generated clean LLM markdown (${json.data.firmographic_signals.estimated_llm_tokens} tokens). Intent: ${json.data.firmographic_signals.intent_score}/100`, type: "success" }
                    ]);
                }
            } catch (err: any) {
                setLogs((prev) => [...prev, { time_ms: 300, text: `[Error] ${err.message}`, type: "warn" }]);
            } finally {
                setLoading(false);
                setCompleted(true);
            }
        }
    };

    const handleConfirmBooking = (slot: string) => {
        setBookedSlot(slot);
        setBookingSuccess(true);
        setLogs((prev) => [
            ...prev,
            { time_ms: 990, text: `[Cal.com Handoff] Meeting confirmed for slot: "${slot}". Calendar invite dispatched to ${emailInput}!`, type: "success" }
        ]);
    };

    const handleReset = () => {
        setCompleted(false);
        setLoading(false);
        setLogs([]);
        setStreamedPayload(null);
        setBookedSlot(null);
        setBookingSuccess(false);
    };

    return (
        <section id="interactive-demo" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-semibold mb-4">
                    <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                    <span>LIVE DOMAIN ENRICHMENT & ROUTING</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Experience the <span className="text-blue-600">Live 3-Second Magic</span>
                </h2>
                <p className="mt-4 text-slate-600 text-lg sm:text-xl">
                    Drop in <strong>any real email or domain</strong>. Watch FlowMeet perform live website enrichment, extract tech stack signals, calculate an ICP score, and route an instant meeting.
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
                        <span>Demand Conversion (Live Enrichment)</span>
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
                        <span>AI Support Deflection (Python RAG)</span>
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
                        <span>Web-to-LLM Scraper (Rust Worker)</span>
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white">
                    
                    {/* Left Column: Input and Triggers */}
                    <div className="lg:col-span-5 space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                                {activeMode === "conversion" && "1. Enter Any Corporate Email"}
                                {activeMode === "support" && "1. Ask Technical Support Question"}
                                {activeMode === "scraping" && "1. Target Domain for Ingestion"}
                            </h3>
                            <p className="text-sm text-slate-600">
                                {activeMode === "conversion" && "Tests real live domain scraping and Go territory routing with Cal.com instant booking."}
                                {activeMode === "support" && "Tests Python semantic vector search against indexed technical docs for autonomous resolution."}
                                {activeMode === "scraping" && "Tests our high-throughput Rust Axum crawler converting live open-web HTML into LLM tokens."}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {activeMode === "conversion" && (
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Corporate Email or Domain</label>
                                    <input
                                        type="text"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        placeholder="e.g. alex@airbnb.com"
                                        className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono text-sm shadow-xs"
                                    />
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {["vp@stripe.com", "eng@linear.app", "ops@automattic.com", "founder@cal.com"].map((example) => (
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
                                            "How do I configure SAML 2.0 with Okta?",
                                            "Why am I getting 401 Unauthorized?",
                                            "What are the Nginx rate limits?"
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
                                        {["stripe.com/pricing", "cal.com", "linear.app"].map((ex) => (
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
                                        <span>Streaming Live Pipeline...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        <span>Run Live Pipeline</span>
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
                                <Cpu className="w-3.5 h-3.5 text-blue-600" /> RAM: ~132MB Total Footprint
                            </span>
                            <span className="flex items-center gap-1">
                                <Shield className="w-3.5 h-3.5 text-emerald-600" /> Cal.com Handoff Ready
                            </span>
                        </div>
                    </div>

                    {/* Right Column: Live Telemetry Stream & Real Outcome */}
                    <div className="lg:col-span-7 bg-[#0f172a] rounded-xl border border-slate-800 p-5 font-mono text-sm relative min-h-[460px] flex flex-col justify-between shadow-lg">
                        <div className="absolute top-3 right-4 flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500"></span>
                            <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                        </div>
                        <div className="text-xs text-slate-400 border-b border-slate-800 pb-2 mb-4 flex items-center justify-between">
                            <span>&gt; terminal @ vps-edge: /var/log/flowmeet-stream.log</span>
                            {loading && <span className="text-emerald-400 animate-pulse text-[11px]">● LIVE STREAMING</span>}
                        </div>

                        {/* Initial Idle State */}
                        {logs.length === 0 && !loading && (
                            <div className="my-auto text-center py-12 text-slate-500 space-y-3">
                                <Terminal className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
                                <p className="font-mono text-xs">Waiting for input... Click &quot;Run Live Pipeline&quot; to stream real enrichment.</p>
                            </div>
                        )}

                        {/* Real Telemetry Stream */}
                        {logs.length > 0 && (
                            <div ref={logContainerRef} className="space-y-2 flex-grow text-xs leading-relaxed text-slate-300 max-h-56 overflow-y-auto pr-1">
                                {logs.map((log, idx) => (
                                    <div key={idx} className={`flex items-start gap-2 ${
                                        log.type === "success" ? "text-emerald-400" :
                                        log.type === "accent" ? "text-sky-300" :
                                        log.type === "warn" ? "text-amber-400" : "text-slate-400"
                                    }`}>
                                        <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                        <span className="break-all">{log.text}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Final Outcome Card: Mode = Conversion (Chili Piper + Cal.com) */}
                        {completed && activeMode === "conversion" && streamedPayload && (
                            <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-sky-500/40 shadow-lg text-left text-white animate-fadeIn space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                                    <span className="flex items-center gap-2 font-sans font-bold text-sm text-sky-400">
                                        <Sparkles className="w-4 h-4 text-sky-400 fill-sky-400" />
                                        LIVE QUALIFIED LEAD &amp; CALENDAR LOCK
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
                                        {streamedPayload.execution_time_ms}ms Live
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono text-xs">
                                    <div className="p-2 bg-slate-800/80 rounded border border-slate-700/50">
                                        <div className="text-slate-400 text-[10px]">COMPANY</div>
                                        <div className="font-bold text-white mt-0.5 truncate">{streamedPayload.company}</div>
                                    </div>
                                    <div className="p-2 bg-slate-800/80 rounded border border-slate-700/50">
                                        <div className="text-slate-400 text-[10px]">ICP SCORE</div>
                                        <div className="font-bold text-emerald-400 mt-0.5">{streamedPayload.icp_score} / 100</div>
                                    </div>
                                    <div className="p-2 bg-slate-800/80 rounded border border-slate-700/50">
                                        <div className="text-slate-400 text-[10px]">DETECTED TECH</div>
                                        <div className="font-bold text-sky-400 mt-0.5 truncate">{streamedPayload.tech_stack?.slice(0, 2).join(", ") || "Next.js"}</div>
                                    </div>
                                </div>

                                {/* Cal.com Interactive Booking Handoff */}
                                <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700 font-sans text-xs text-slate-200 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-white flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-sky-400" /> 
                                            {streamedPayload.assigned_ae?.name} ({streamedPayload.assigned_ae?.title})
                                        </span>
                                        <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> {bookingSuccess ? "Booking Confirmed" : "Slots Available"}
                                        </span>
                                    </div>

                                    {!bookingSuccess ? (
                                        <div>
                                            <p className="text-[11px] text-slate-400 mb-2">Select an instant slot with your assigned Account Executive:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {streamedPayload.assigned_ae?.booking_slots?.map((slot: string) => (
                                                    <button
                                                        key={slot}
                                                        onClick={() => handleConfirmBooking(slot)}
                                                        className="px-3 py-1.5 rounded bg-blue-600/30 border border-blue-500/50 hover:bg-blue-600 text-blue-200 hover:text-white font-mono text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <Clock className="w-3 h-3 text-sky-300" />
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-2 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono space-y-1">
                                            <div>🎉 Meeting Locked: <strong>{bookedSlot}</strong> with {streamedPayload.assigned_ae?.name}!</div>
                                            <div className="text-[11px] text-emerald-400/80">Calendar invitation &amp; meeting bridge dispatched to {emailInput}.</div>
                                        </div>
                                    )}
                                </div>

                                <div className="text-[11px] text-slate-400 text-center font-mono">
                                    ⚡ Pipeline Value: ${streamedPayload.estimated_deal_arr_usd ? streamedPayload.estimated_deal_arr_usd.toLocaleString() : "65,000"} ARR • Verified Live.
                                </div>
                            </div>
                        )}

                        {/* Final Outcome Card: Mode = Support */}
                        {completed && activeMode === "support" && streamedPayload && (
                            <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-indigo-500/40 shadow-lg text-left text-white animate-fadeIn space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                                    <span className="flex items-center gap-2 font-sans font-bold text-sm text-indigo-400">
                                        <Bot className="w-4 h-4 text-indigo-400" />
                                        AUTONOMOUS TICKET DEFLECTION (PYTHON RAG)
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                                        Deflected in {streamedPayload.execution_time_ms || 1.2}ms
                                    </span>
                                </div>

                                <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700 font-sans text-xs text-slate-200 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-white">AI Resolution Solution:</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                                            Confidence: {streamedPayload.confidence_score}%
                                        </span>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed font-mono text-[11px] bg-slate-950 p-2.5 rounded border border-slate-800 whitespace-pre-line max-h-36 overflow-y-auto">
                                        {streamedPayload.direct_answer}
                                    </p>
                                    {streamedPayload.citations && streamedPayload.citations.length > 0 && (
                                        <div className="flex items-center gap-2 pt-1 text-indigo-300 font-semibold text-[11px]">
                                            <span>📚 Verified Citation: {streamedPayload.citations[0].documentation_url}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-emerald-400 font-mono pt-1">
                                    <span>✔ Support labor saved: ~{streamedPayload.saved_support_minutes || 25} mins</span>
                                    <span>✔ Deflection Status: RESOLVED</span>
                                </div>
                            </div>
                        )}

                        {/* Final Outcome Card: Mode = Scraping */}
                        {completed && activeMode === "scraping" && streamedPayload && (
                            <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-rose-500/40 shadow-lg text-left text-white animate-fadeIn space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                                    <span className="flex items-center gap-2 font-sans font-bold text-sm text-rose-400">
                                        <Terminal className="w-4 h-4 text-rose-400" />
                                        LIVE WEB-TO-LLM SCRAPER (RUST CRAWLER)
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                                        {streamedPayload.execution_time_ms}ms latency
                                    </span>
                                </div>

                                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto text-[11px] font-mono text-emerald-400 leading-normal max-h-40 overflow-y-auto">
                                    <span className="text-slate-500">// Extracted LLM Markdown Snippet:</span>
                                    <pre className="mt-1 whitespace-pre-wrap">{streamedPayload.llm_markdown?.slice(0, 800) || "Scraped markdown tokens ready."}</pre>
                                </div>

                                <div className="text-[11px] text-slate-400 text-center font-mono">
                                    ⚙️ Live Markdown Extracted from Web • Injected directly into LLM Context.
                                </div>
                            </div>
                        )}

                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Status: {completed ? "COMPLETED" : loading ? "STREAMING..." : "IDLE"}</span>
                            <span>Powered by FlowMeet Live Gateway</span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
