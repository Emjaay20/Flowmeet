import Header from "./components/Header";
import InteractiveWidget from "./components/InteractiveWidget";
import ArchitectureSection from "./components/ArchitectureSection";
import EnablementDashboardPreview from "./components/EnablementDashboardPreview";
import ContactForm from "./components/ContactForm";
import { Sparkles, ArrowRight, CheckCircle2, Terminal, Cpu, ShieldCheck, Zap, Globe, GitBranch } from "lucide-react";
import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-blue-600 selection:text-white">
            <Header />

            {/* Hero Section */}
            <section className="pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-subtle-grid border-b border-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                    {/* Top Tech Badge */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-50 border border-gray-200 shadow-xs mb-8">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                        </span>
                        <span className="text-xs font-mono font-semibold text-slate-700">
                            POLYGLOT INFRA: <span className="text-blue-600">RUST</span> + <span className="text-amber-600">GOLANG</span> + <span className="text-indigo-600">PYTHON RAG</span>
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200 ml-1">v2.0 LIVE</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-5xl mx-auto mb-6">
                        Turn Web Traffic into Pipeline & Deflect Support in <span className="text-blue-600">&lt;3 Seconds</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="max-w-3xl mx-auto text-lg sm:text-2xl text-slate-600 font-normal leading-relaxed mb-10">
                        The AI Revenue & Enablement Super-Engine. Inspired by <strong className="text-slate-900 font-semibold">Chili Piper</strong> conversion, <strong className="text-slate-900 font-semibold">Luminovo</strong> triage, and <strong className="text-slate-900 font-semibold">Firecrawl</strong> web scraping—built to run flawlessly on lightweight edge nodes.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
                        <a
                            href="#interactive-demo"
                            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            <Zap className="w-5 h-5 fill-white text-white" />
                            <span>Test Live Engine</span>
                        </a>
                        <Link
                            href="/docs"
                            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-gray-300 font-mono text-sm font-semibold transition-all flex items-center justify-center gap-2"
                        >
                            <Terminal className="w-4 h-4 text-slate-600" />
                            <span>Architecture Docs</span>
                        </Link>
                    </div>

                    {/* Social Proof & DevOps Reliability Banner */}
                    <div className="pt-8 border-t border-gray-200 max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-xs font-mono text-slate-500 font-medium">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>99.99% Edge Uptime (Automattic Specs)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-blue-600" />
                            <span>Oracle 1GB VPS Tuned (Linux Cgroups)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-indigo-600" />
                            <span>Transformers.js Local WASM</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Demo Widget Section */}
            <div id="conversion" className="bg-slate-50 border-b border-gray-200">
                <InteractiveWidget />
            </div>

            {/* Polyglot Architecture Superpowers */}
            <div id="support-triage" className="bg-white border-b border-gray-200">
                <ArchitectureSection />
            </div>

            {/* Enablement & RevOps KPIs */}
            <div className="bg-slate-50 border-b border-gray-200">
                <EnablementDashboardPreview />
            </div>

            {/* Contact & White-Label Resell Section */}
            <section id="contact" className="py-24 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                        Deploy FlowMeet for <span className="text-blue-600">Your Enterprise</span>
                    </h2>
                    <p className="mt-4 text-slate-600 text-lg">
                        Want to acquire white-label resale licensing, integrate custom internal data sources, or discuss senior architecture & AI engineering roles? Reach out below.
                    </p>
                </div>
                <div className="relative z-10">
                    <ContactForm />
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-slate-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold tracking-tight">FlowMeet AI Suite v2.0</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
                        <a href="#interactive-demo" className="hover:text-white transition-colors">Interactive Demo</a>
                        <a href="#architecture" className="hover:text-white transition-colors">Polyglot Specs</a>
                        <a href="#enablement-kpis" className="hover:text-white transition-colors">RevOps Impact</a>
                        <Link href="/docs" className="hover:text-white transition-colors">API Reference</Link>
                        <a href="https://github.com/Emjaay20/Flowmeet" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white flex items-center gap-1">
                            <GitBranch className="w-4 h-4" /> GitHub Repo
                        </a>
                    </div>

                    <div className="text-xs text-slate-500 font-mono">
                        © 2026 FlowMeet Inc. All rights reserved. Built for ultra-high availability.
                    </div>
                </div>
            </footer>
        </div>
    );
}
