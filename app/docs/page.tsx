"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { 
    Terminal, 
    Database, 
    Calendar, 
    Zap, 
    GitBranch, 
    Layers, 
    Check, 
    Copy, 
    ArrowRight, 
    RefreshCw, 
    Building2, 
    UserCheck,
    Cpu,
    ExternalLink
} from "lucide-react";

export default function DocsPage() {
    const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
    const [sfLoading, setSfLoading] = useState(false);
    const [sfResult, setSfResult] = useState<any>(null);
    const [selectedCompany, setSelectedCompany] = useState<"stripe" | "linear" | "acme">("stripe");

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(id);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleTestSalesforce = async () => {
        setSfLoading(true);
        try {
            const domainMap = {
                stripe: { email: "vp@stripe.com", company: "Stripe", domain: "stripe.com", icpScore: 99 },
                linear: { email: "eng@linear.app", company: "Linear", domain: "linear.app", icpScore: 94 },
                acme: { email: "alex@acmestore.io", company: "Acme Store", domain: "acmestore.io", icpScore: 65 }
            };
            const target = domainMap[selectedCompany];

            const res = await fetch("/api/salesforce/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(target)
            });
            const data = await res.json();
            setSfResult(data);
        } catch (err: any) {
            console.error("Salesforce sync error:", err);
        } finally {
            setSfLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fcfcf9] text-zinc-900 font-sans antialiased selection:bg-[#c8f944] selection:text-zinc-950">
            <Header />

            <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                
                {/* Header Title */}
                <div className="max-w-4xl mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-mono font-medium mb-4">
                        <Terminal className="w-3.5 h-3.5 text-zinc-950" />
                        <span>ARCHITECTURE &amp; CRM INTEGRATION SPECIFICATIONS</span>
                    </div>
                    <h1 className="font-editorial text-4xl sm:text-6xl font-normal text-zinc-950 tracking-tight leading-[1.1] mb-6">
                        Architectural Decisions &amp; <br />
                        <span className="italic font-serif text-zinc-800">Salesforce CRM Integration.</span>
                    </h1>
                    <p className="text-zinc-600 text-base sm:text-lg leading-relaxed font-sans">
                        Comprehensive documentation of Flowmeet&apos;s inbound demand conversion pipeline, RFC 5545 calendar handoffs, and enterprise CRM sync architecture modeled after Chili Piper Form Concierge &amp; Distro.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* Left Sticky Table of Contents */}
                    <div className="hidden lg:block lg:col-span-3 sticky top-24 space-y-4 text-xs font-mono">
                        <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-xs space-y-2.5">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                                ARCHITECTURAL DECISIONS (ADR)
                            </span>
                            <a href="#adr-001" className="block text-zinc-600 hover:text-zinc-950 hover:underline">
                                01. Calendar Mechanics (RFC 5545)
                            </a>
                            <a href="#adr-002" className="block text-zinc-600 hover:text-zinc-950 hover:underline">
                                02. Salesforce CRM &amp; L2A Sync
                            </a>
                            <a href="#adr-003" className="block text-zinc-600 hover:text-zinc-950 hover:underline">
                                03. Chili Piper Equivalence
                            </a>
                            <a href="#adr-004" className="block text-zinc-600 hover:text-zinc-950 hover:underline">
                                04. Marketing Automation Hooks
                            </a>
                            <a href="#live-tester" className="block text-emerald-700 font-bold hover:underline">
                                → Live Salesforce REST Tester
                            </a>
                        </div>
                    </div>

                    {/* Right Main Content */}
                    <div className="lg:col-span-9 space-y-16">

                        {/* ADR 001: Calendar Mechanics */}
                        <section id="adr-001" className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 sm:p-10 space-y-6">
                            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 pb-2 border-b border-zinc-100">
                                <Calendar className="w-4 h-4 text-zinc-900" />
                                <span className="font-bold text-zinc-950">ADR-001</span> • CORE ENGINE
                            </div>
                            <h2 className="font-editorial text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
                                How Meetings Are Created: RFC 5545 iCalendar Transport
                            </h2>
                            <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                                When a prospect selects a time slot in Flowmeet, the system bypasses external calendar redirects and generates an RFC 5545 compliant <code className="text-xs font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-900">.ics</code> MIME object sent directly via Resend email transport.
                            </p>

                            <div className="bg-zinc-950 text-white rounded-2xl p-4 font-mono text-xs overflow-x-auto border border-zinc-800">
                                <div className="text-[10px] text-zinc-400 mb-2 pb-1 border-b border-zinc-800 flex justify-between">
                                    <span>RFC 5545 VEVENT PAYLOAD SPECIFICATION</span>
                                    <span>METHOD: REQUEST</span>
                                </div>
                                <pre className="text-[11px] text-zinc-300 leading-relaxed">
{`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Flowmeet Inc//Inbound Discovery//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:flowmeet-1793551076@yusufsaka.dev
DTSTAMP:20261101T170000Z
DTSTART:20261102T150000Z
DTEND:20261102T153000Z
SUMMARY:Flowmeet Discovery • Stripe & Yusuf Abubakar
LOCATION:https://meet.google.com/flw-meet-live
ORGANIZER;CN="Yusuf Abubakar":mailto:yusuf@yusufsaka.dev
ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION:mailto:vp@stripe.com
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`}
                                </pre>
                            </div>

                            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 leading-relaxed space-y-1">
                                <strong className="font-semibold text-zinc-950">Why This Eliminates Dropoff:</strong>
                                <p>
                                    When Gmail, Apple Mail, or Outlook receives an email with <code className="text-zinc-900 font-mono">METHOD:REQUEST</code>, the email client renders interactive <em>&ldquo;Yes / Maybe / No&rdquo;</em> buttons directly at the top of the message and automatically places the meeting on both parties&apos; calendars without requiring any manual clicks or calendar logins.
                                </p>
                            </div>
                        </section>

                        {/* ADR 002: Salesforce CRM & Data Model */}
                        <section id="adr-002" className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 sm:p-10 space-y-6">
                            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 pb-2 border-b border-zinc-100">
                                <Database className="w-4 h-4 text-zinc-900" />
                                <span className="font-bold text-zinc-950">ADR-002</span> • CRM DATA MODEL
                            </div>
                            <h2 className="font-editorial text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
                                Salesforce CRM Architecture &amp; Lead-to-Account (L2A) Matching
                            </h2>
                            <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                                Salesforce is the single source of truth for enterprise RevOps teams. Flowmeet implements standard and custom object synchronization, adhering to Chili Piper&apos;s data model specifications:
                            </p>

                            {/* Object Mapping Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200">
                                        <span className="font-mono font-bold text-zinc-900">1. Account Object (001...)</span>
                                        <span className="font-mono text-[10px] text-zinc-500">Target Match</span>
                                    </div>
                                    <p className="text-zinc-600 mb-2">
                                        Queries domain via SOQL (<code className="font-mono text-zinc-800">Website LIKE &apos;%domain%&apos;</code>). If an existing enterprise account exists, Flowmeet extracts the <code className="font-mono text-zinc-800">Account.OwnerId</code> to preserve account ownership.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200">
                                        <span className="font-mono font-bold text-zinc-900">2. Lead Object (00Q...)</span>
                                        <span className="font-mono text-[10px] text-zinc-500">New Prospect</span>
                                    </div>
                                    <p className="text-zinc-600 mb-2">
                                        If no Account matches, a new Lead is created with <code className="font-mono text-zinc-800">Rating: &apos;Hot&apos;</code>, <code className="font-mono text-zinc-800">LeadSource: &apos;Flowmeet Concierge&apos;</code>, and custom fields (<code className="font-mono text-zinc-800">ICP_Score__c</code>).
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200">
                                        <span className="font-mono font-bold text-zinc-900">3. Event Object (00U...)</span>
                                        <span className="font-mono text-[10px] text-zinc-500">Calendar Activity</span>
                                    </div>
                                    <p className="text-zinc-600 mb-2">
                                        Immediately logs the confirmed meeting under <code className="font-mono text-zinc-800">WhoId: Lead.Id</code> and <code className="font-mono text-zinc-800">WhatId: Account.Id</code> with Google Meet URL and assigned Sales Rep.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200">
                                        <span className="font-mono font-bold text-zinc-900">4. Opportunity (006...)</span>
                                        <span className="font-mono text-[10px] text-zinc-500">Pipeline Tracking</span>
                                    </div>
                                    <p className="text-zinc-600 mb-2">
                                        Pre-populates deal stage to <em>&ldquo;Stage 1 - Discovery Scheduled&rdquo;</em> with estimated ARR computed from detected employee tier.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* ADR 003: Chili Piper Product Equivalence */}
                        <section id="adr-003" className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 sm:p-10 space-y-6">
                            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 pb-2 border-b border-zinc-100">
                                <Zap className="w-4 h-4 text-zinc-900" />
                                <span className="font-bold text-zinc-950">ADR-003</span> • PRODUCT EQUIVALENCE MATRIX
                            </div>
                            <h2 className="font-editorial text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
                                Alignment with Chili Piper&apos;s Demand Conversion Platform
                            </h2>
                            <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                                Flowmeet was intentionally engineered to mirror the operational lifecycle of Chili Piper&apos;s three flagship products:
                            </p>

                            <div className="space-y-4 text-xs font-sans">
                                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <strong className="text-zinc-950 block text-sm">Chili Piper Form Concierge</strong>
                                        <p className="text-zinc-600">Interception of website form submissions, live domain qualification, and instant calendar presentation without page refresh.</p>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold whitespace-nowrap">
                                        Flowmeet Scraper + SSE Stream
                                    </span>
                                </div>

                                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <strong className="text-zinc-950 block text-sm">Chili Piper Distro</strong>
                                        <p className="text-zinc-600">Lead-to-Account matching, round-robin rules, and territory assignment in under 50ms based on Salesforce ownership.</p>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold whitespace-nowrap">
                                        Flowmeet Go Concierge (:8082)
                                    </span>
                                </div>

                                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <strong className="text-zinc-950 block text-sm">Chili Piper Instant Booker / Handoff</strong>
                                        <p className="text-zinc-600">Cal.com / Google Calendar API invocation, meeting invitation dispatch, and real-time CRM event logging.</p>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold whitespace-nowrap">
                                        Flowmeet /api/book-slot + Resend
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* ADR 004: Firecrawl & Luminovo Integration */}
                        <section id="adr-004" className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 sm:p-10 space-y-6">
                            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 pb-2 border-b border-zinc-100">
                                <Cpu className="w-4 h-4 text-zinc-900" />
                                <span className="font-bold text-zinc-950">ADR-004</span> • FIRECRAWL &amp; LUMINOVO PIPELINE
                            </div>
                            <h2 className="font-editorial text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
                                Firecrawl LLM Scraping &amp; Luminovo RAG Triage
                            </h2>
                            <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                                Enterprise enrichment requires adversarial DOM extraction that bypasses modern anti-bot protections, alongside automated technical question answering that defends AE calendars:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                                        <span className="font-mono font-bold text-zinc-900">Firecrawl v1 API Integration</span>
                                        <span className="font-mono text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">11,000+ Credits Active</span>
                                    </div>
                                    <p className="text-zinc-600">
                                        Flowmeet connects directly to <code className="font-mono text-zinc-800">POST https://api.firecrawl.dev/v1/scrape</code> to strip JavaScript bloat, bypass bot protections, and return token-dense LLM markdown ready for firmographic extraction.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                                        <span className="font-mono font-bold text-zinc-900">Luminovo-Style RAG Triage</span>
                                        <span className="font-mono text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">FastAPI :8083</span>
                                    </div>
                                    <p className="text-zinc-600">
                                        Modeled after Luminovo&apos;s FinAI / Lumi technical enablement engine. Matches incoming prospect questions against company documentation vector embeddings in Supabase (pgvector) to auto-answer technical RFPs and deflect non-revenue tickets.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Interactive Live Salesforce REST API Tester */}
                        <section id="live-tester" className="bg-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-xl p-6 sm:p-10 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-[#c8f944]" />
                                    <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                                        LIVE SALESFORCE REST API TESTER
                                    </h3>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-[10px] font-mono text-[#c8f944] border border-zinc-700">
                                    POST /api/salesforce/sync
                                </span>
                            </div>

                            <p className="text-xs text-zinc-400 font-sans">
                                Test how Flowmeet executes real-time Lead-to-Account (L2A) SOQL queries, routes to existing Account Owners, and creates Salesforce Event objects:
                            </p>

                            {/* Select Company Preset */}
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-xs font-mono text-zinc-400">Select Prospect Domain:</span>
                                {(["stripe", "linear", "acme"] as const).map((comp) => (
                                    <button
                                        key={comp}
                                        type="button"
                                        onClick={() => {
                                            setSelectedCompany(comp);
                                            setSfResult(null);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
                                            selectedCompany === comp
                                                ? "bg-[#c8f944] text-zinc-950 font-bold border-[#c8f944]"
                                                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                                        }`}
                                    >
                                        {comp.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            {/* Trigger Button */}
                            <button
                                type="button"
                                onClick={handleTestSalesforce}
                                disabled={sfLoading}
                                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {sfLoading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                                        <span>Executing Salesforce SOQL &amp; Event Creation...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Trigger Salesforce Sync Simulation</span>
                                        <ArrowRight className="w-4 h-4 text-zinc-950" />
                                    </>
                                )}
                            </button>

                            {/* Response JSON Output */}
                            {sfResult && (
                                <div className="mt-4 rounded-2xl bg-zinc-900 p-4 border border-zinc-800 font-mono text-xs">
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[10px] text-zinc-400">
                                        <span className="text-emerald-400">✓ 200 OK — SALESFORCE REST RESPONSE</span>
                                        <span>Execution: {sfResult.salesforce?.leadOrAccount?.latencyMs}ms</span>
                                    </div>
                                    <pre className="text-[11px] text-[#c8f944] overflow-x-auto leading-relaxed">
                                        <code>{JSON.stringify(sfResult, null, 2)}</code>
                                    </pre>
                                </div>
                            )}
                        </section>

                    </div>

                </div>

            </main>

            <Footer />
        </div>
    );
}
