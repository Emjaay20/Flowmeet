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
    ArrowRight,
    Check,
    Globe,
    Clock,
    Lock,
    ExternalLink
} from "lucide-react";

interface LogEntry {
    time_ms: number;
    text: string;
    type?: "system" | "success" | "warn" | "accent";
}

export default function InteractiveWidget() {
    const [emailInput, setEmailInput] = useState("vp@stripe.com");
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);

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

    const handleRunEngine = async (overrideEmail?: string) => {
        const targetEmail = overrideEmail || emailInput;
        if (!targetEmail.trim()) return;

        setLoading(true);
        setCompleted(false);
        setStreamedPayload(null);
        setBookedSlot(null);
        setBookingSuccess(false);
        setLogs([
            { time_ms: 0, text: `[0ms] Resolving target identity for ${targetEmail}...`, type: "system" }
        ]);

        try {
            const response = await fetch("/api/stream-enrich", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: targetEmail })
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
    };

    const handleConfirmBooking = (slot: string) => {
        setBookedSlot(slot);
        setBookingSuccess(true);
        setLogs((prev) => [
            ...prev,
            { time_ms: 990, text: `[Cal.com Handoff] Meeting confirmed for slot: "${slot}". Calendar invite dispatched to ${emailInput}!`, type: "success" }
        ]);
    };

    const handleSelectChip = (chip: string) => {
        setEmailInput(chip);
        handleRunEngine(chip);
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
        <section id="interactive-demo" className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden border-b border-zinc-200/80 bg-[#fcfcf9]">
            {/* Subtle background mesh */}
            <div className="absolute inset-0 subtle-dot-grid opacity-60 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    
                    {/* Left Column: Hero Copy & Live Input Pill */}
                    <div className="lg:col-span-6 space-y-6">
                        {/* Editorial Headline */}
                        <h1 className="font-editorial text-5xl sm:text-7xl font-normal text-zinc-950 tracking-tight leading-[1.05]">
                            Turn any email <br className="hidden sm:inline" />
                            or domain into a <br className="hidden sm:inline" />
                            <span className="italic font-serif text-zinc-900">booked meeting.</span> <br className="hidden sm:inline" />
                            Instantly.
                        </h1>

                        {/* Crisp Subtitle */}
                        <p className="text-zinc-600 text-base sm:text-lg leading-relaxed max-w-xl font-sans">
                            Stop losing qualified inbound pipeline to 48-hour SDR delays. Flowmeet parses company domains in seconds, evaluates territory routing rules, and reserves meeting slots directly in your AE&apos;s calendar before the prospect leaves your site.
                        </p>

                        {/* Interactive Pill Input Container */}
                        <div className="pt-2">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleRunEngine();
                                }}
                                className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white p-2 rounded-2xl sm:rounded-full border border-zinc-300 shadow-lg shadow-zinc-900/5 focus-within:border-zinc-950 focus-within:ring-2 focus-within:ring-zinc-950/10 transition-all max-w-xl"
                            >
                                <div className="flex items-center flex-grow pl-3 pr-2 py-2">
                                    <Globe className="w-5 h-5 text-zinc-400 mr-2 flex-shrink-0" />
                                    <input
                                        type="text"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        placeholder="Enter company email (e.g. vp@stripe.com)"
                                        className="w-full bg-transparent text-sm sm:text-base font-sans text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 rounded-full bg-[#c8f944] text-zinc-950 font-bold text-sm tracking-tight hover:bg-[#bbf32d] shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                                            <span>Enriching...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Route &amp; Book Demo</span>
                                            <ArrowRight className="w-4 h-4 text-zinc-950" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Quick Test Chips */}
                            <div className="flex flex-wrap items-center gap-2 mt-3.5">
                                <span className="text-[11px] font-mono text-zinc-600 uppercase tracking-wider mr-1">Try live:</span>
                                {[
                                    "vp@stripe.com",
                                    "eng@linear.app",
                                    "ops@automattic.com",
                                    "founder@cal.com"
                                ].map((chip) => (
                                    <button
                                        key={chip}
                                        type="button"
                                        onClick={() => handleSelectChip(chip)}
                                        className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-mono transition-colors border border-zinc-200/80 cursor-pointer"
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>

                            {/* Trust badges */}
                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-5 text-xs font-mono text-zinc-600">
                                <span className="flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> Real DOM scraping
                                </span>
                                <span className="flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> 22μs Go territory rules
                                </span>
                                <span className="flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> Cal.com instant booking
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live VPS Terminal & Outcome Window */}
                    <div className="lg:col-span-6">
                        <div className="bg-[#0c0d0e] rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden font-mono text-xs flex flex-col justify-between min-h-[480px]">
                            {/* Window Header */}
                            <div className="bg-[#141517] px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                                    <span className="ml-2 text-zinc-400 text-[11px]">
                                        flowmeet-edge-vps-01 (194.163.172.101) - 443 SSL
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {loading ? (
                                        <span className="text-[#c8f944] text-[10px] animate-pulse flex items-center gap-1 font-bold">
                                            ● STREAMING SSE
                                        </span>
                                    ) : (
                                        <span className="text-zinc-500 text-[10px]">READY</span>
                                    )}
                                </div>
                            </div>

                            {/* Window Body: Terminal Stream */}
                            <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                                {logs.length === 0 && !loading && (
                                    <div className="my-auto text-center py-12 text-zinc-500 space-y-3">
                                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                                            <Terminal className="w-6 h-6 animate-pulse" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-zinc-300 font-sans font-medium text-sm">Empower your GTM with live polyglot execution</p>
                                            <p className="text-zinc-500 text-xs">Enter any corporate email or click a chip on the left to start live DOM crawling, scoring &amp; calendar reservation.</p>
                                        </div>
                                    </div>
                                )}

                                {logs.length > 0 && (
                                    <div
                                        ref={logContainerRef}
                                        className="space-y-2 flex-grow text-xs leading-relaxed text-zinc-300 max-h-56 overflow-y-auto pr-1"
                                    >
                                        {logs.map((log, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex items-start gap-2 ${
                                                    log.type === "success"
                                                        ? "text-emerald-400"
                                                        : log.type === "accent"
                                                        ? "text-[#c8f944]"
                                                        : log.type === "warn"
                                                        ? "text-amber-400"
                                                        : "text-zinc-400"
                                                }`}
                                            >
                                                <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                                <span className="break-all">{log.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Real Qualified Outcome Card */}
                                {completed && streamedPayload && (
                                    <div className="mt-2 p-4 rounded-xl bg-[#141618] border border-zinc-700 shadow-lg text-left text-white animate-fadeIn space-y-3">
                                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                                            <span className="flex items-center gap-2 font-sans font-bold text-xs text-[#c8f944]">
                                                <Sparkles className="w-3.5 h-3.5 text-[#c8f944] fill-[#c8f944]" />
                                                LIVE QUALIFIED ACCOUNT • {streamedPayload.company}
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                                                {streamedPayload.execution_time_ms}ms Live Total
                                            </span>
                                        </div>

                                        {/* Metrics Row */}
                                        <div className="grid grid-cols-3 gap-2 py-0.5 text-center font-mono text-xs">
                                            <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                                                <div className="text-zinc-500 text-[10px]">ICP SCORE</div>
                                                <div className="font-bold text-emerald-400 mt-0.5">{streamedPayload.icp_score} / 100</div>
                                            </div>
                                            <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                                                <div className="text-zinc-500 text-[10px]">ROUTING TIER</div>
                                                <div className="font-bold text-[#c8f944] mt-0.5 truncate">{streamedPayload.tier}</div>
                                            </div>
                                            <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                                                <div className="text-zinc-500 text-[10px]">DETECTED TECH</div>
                                                <div className="font-bold text-zinc-200 mt-0.5 truncate">{streamedPayload.tech_stack?.slice(0, 2).join(", ") || "Next.js"}</div>
                                            </div>
                                        </div>

                                        {/* Interactive Cal.com Booking Handoff */}
                                        <div className="p-3 bg-zinc-900/90 rounded-lg border border-zinc-700/80 font-sans text-xs text-zinc-200 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-white flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-[#c8f944]" />
                                                    {streamedPayload.assigned_ae?.name} ({streamedPayload.assigned_ae?.title})
                                                </span>
                                                <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> {bookingSuccess ? "Booking Confirmed" : "Live Slots"}
                                                </span>
                                            </div>

                                            {!bookingSuccess ? (
                                                <div>
                                                    <p className="text-[11px] text-zinc-400 mb-2 font-mono">
                                                        Select available Cal.com slot with assigned AE:
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {streamedPayload.assigned_ae?.booking_slots?.map((slot: string) => (
                                                            <button
                                                                key={slot}
                                                                type="button"
                                                                onClick={() => handleConfirmBooking(slot)}
                                                                className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-[#c8f944] hover:text-zinc-950 hover:border-[#c8f944] text-zinc-200 font-mono text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
                                                            >
                                                                <Clock className="w-3 h-3" />
                                                                {slot}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-2 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono space-y-0.5">
                                                    <div>🎉 Meeting Reserved: <strong>{bookedSlot}</strong> with {streamedPayload.assigned_ae?.name}</div>
                                                    <div className="text-[10px] text-emerald-400/80">Calendar invitation &amp; meeting bridge dispatched to {emailInput}.</div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-[10px] text-zinc-500 text-center font-mono flex items-center justify-between pt-1">
                                            <span>Est. Deal ARR: ${streamedPayload.estimated_deal_arr_usd?.toLocaleString() || "65,000"}</span>
                                            <button
                                                onClick={handleReset}
                                                className="text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                                            >
                                                ↺ Test Another Domain
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Terminal Footer */}
                            <div className="bg-[#141517] px-4 py-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                                <span>Status: {completed ? "COMPLETE (200 OK)" : loading ? "STREAMING EVENTS..." : "IDLE"}</span>
                                <span>Powered by Flowmeet Polyglot Stack</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
