"use client";

import { useState } from "react";
import { Copy, Check, Code, Sparkles, ArrowRight, ShieldCheck, Calendar, CheckCircle2 } from "lucide-react";

export default function EmbedSection() {
    const [domain, setDomain] = useState("acmecorp.io");
    const [handoffType, setHandoffType] = useState<"inline" | "modal">("modal");
    const [copied, setCopied] = useState(false);
    const [previewSelectedSlot, setPreviewSelectedSlot] = useState<string | null>("Tomorrow 10:00 AM");
    const [previewBooked, setPreviewBooked] = useState(false);

    const embedCode = `<script 
  src="https://flowmeet.aetherhost.com.ng/v2/embed.js" 
  data-site-id="fm_live_9a82b" 
  data-domain="${domain}"
  data-handoff="${handoffType}"
  async>
</script>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section id="embed" className="py-24 sm:py-32 bg-[#fcfcf9] border-b border-zinc-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="max-w-3xl mb-16">
                    <div className="text-xs font-mono font-semibold tracking-wider text-zinc-500 uppercase mb-3">
                        04 • One-Line JavaScript Embed
                    </div>
                    <h2 className="font-editorial text-4xl sm:text-6xl font-normal text-zinc-950 tracking-tight leading-[1.1]">
                        Drop Flowmeet on your site. <br className="hidden sm:inline" />
                        <span className="italic font-serif text-zinc-800">Meetings start tonight.</span>
                    </h2>
                    <p className="mt-4 text-zinc-600 text-sm sm:text-base leading-relaxed font-sans">
                        Zero complex migrations. Works alongside Webflow, Framer, Next.js, or plain HTML. Flowmeet listens to standard form submits, runs background enrichment in &lt;3s, and brings up Cal.com without a single page reload.
                    </p>
                </div>

                {/* 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    {/* Left: Embed Configurator & Script Box */}
                    <div className="lg:col-span-6 bg-white rounded-2xl border border-zinc-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                            <span className="text-xs font-mono font-bold text-zinc-900 uppercase tracking-wider">
                                CONFIGURE EMBED SNIPPET
                            </span>
                            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
                                CDN Ready
                            </span>
                        </div>

                        {/* Input 1: Company Domain */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-mono text-zinc-700 uppercase font-semibold">
                                Target Website Domain
                            </label>
                            <input 
                                type="text"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                placeholder="acmecorp.io"
                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm font-mono text-zinc-900 focus:outline-none focus:border-zinc-950"
                            />
                        </div>

                        {/* Input 2: Display Format */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-mono text-zinc-700 uppercase font-semibold">
                                Calendar Handoff Style
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setHandoffType("modal")}
                                    className={`py-2 px-3 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
                                        handoffType === "modal"
                                            ? "bg-zinc-950 text-white border-zinc-950 font-bold"
                                            : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                                    }`}
                                >
                                    Modal Overlay (Default)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setHandoffType("inline")}
                                    className={`py-2 px-3 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
                                        handoffType === "inline"
                                            ? "bg-zinc-950 text-white border-zinc-950 font-bold"
                                            : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                                    }`}
                                >
                                    Inline Dynamic Frame
                                </button>
                            </div>
                        </div>

                        {/* Code Snippet Box */}
                        <div className="rounded-2xl bg-zinc-950 p-4 border border-zinc-800 text-white font-mono text-xs">
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[10px] text-zinc-400">
                                <span>PASTE IN &lt;HEAD&gt; OR BEFORE &lt;/BODY&gt;</span>
                                <button 
                                    onClick={handleCopy}
                                    className="flex items-center gap-1 text-[#c8f944] hover:text-white transition-colors cursor-pointer"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copied ? "Copied" : "Copy"}</span>
                                </button>
                            </div>
                            <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed">
                                <code>{embedCode}</code>
                            </pre>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-zinc-500 font-sans">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Zero bundle pollution: 4.8KB minified &amp; gzipped, loaded asynchronously.</span>
                        </div>
                    </div>

                    {/* Right: Live Interactive End-User Preview Card */}
                    <div className="lg:col-span-6 bg-white rounded-2xl border border-zinc-200/90 shadow-xl p-6 sm:p-8">
                        
                        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
                            <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
                                VISITOR PERSPECTIVE PREVIEW
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#c8f944]/30 text-zinc-950 font-mono text-[10px] font-bold border border-[#c8f944]">
                                In-Session Cal.com Handoff
                            </span>
                        </div>

                        {/* Mock Visitor Form Container */}
                        <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                            
                            {/* Visitor Input */}
                            <div>
                                <label className="text-[11px] font-mono text-zinc-500 block mb-1">
                                    Step 1: Visitor Submits Form on Your Site
                                </label>
                                <div className="p-3 bg-white rounded-xl border border-zinc-300 text-xs font-mono text-zinc-900 flex items-center justify-between">
                                    <span>alex.mercer@stripe.com</span>
                                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        ✓ ICP Score: 98/100
                                    </span>
                                </div>
                            </div>

                            {/* In-Session Instant Slot Drawer */}
                            <div className="pt-2 border-t border-zinc-200">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-sans font-bold text-zinc-900">
                                        Select a time with Elena Rostova (Enterprise AE)
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-500">
                                        30 min call
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {[
                                        "Today 4:00 PM",
                                        "Tomorrow 10:00 AM",
                                        "Tomorrow 2:30 PM"
                                    ].map((slot) => {
                                        const isSelected = previewSelectedSlot === slot;
                                        return (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => {
                                                    setPreviewSelectedSlot(slot);
                                                    setPreviewBooked(false);
                                                }}
                                                className={`py-2 px-2 rounded-xl text-xs font-mono transition-all cursor-pointer text-center ${
                                                    isSelected
                                                        ? "bg-zinc-950 text-[#c8f944] font-bold border border-zinc-950 shadow-xs"
                                                        : "bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-400"
                                                }`}
                                            >
                                                {slot}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setPreviewBooked(true)}
                                    className="w-full py-2.5 rounded-xl bg-[#c8f944] hover:bg-[#bbf32d] text-zinc-950 font-sans font-bold text-xs tracking-tight transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                    {previewBooked ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 text-zinc-950" />
                                            <span>Meeting Confirmed on Google Calendar!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Calendar className="w-4 h-4 text-zinc-950" />
                                            <span>Confirm Slot with Elena</span>
                                        </>
                                    )}
                                </button>
                            </div>

                        </div>

                        <p className="text-[11px] font-mono text-zinc-400 mt-4 text-center">
                            Zero tab switching • Zero booking link emails required • 0% dropoff
                        </p>

                    </div>

                </div>

            </div>
        </section>
    );
}
