"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Menu, X, Activity, ShieldCheck } from "lucide-react";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
            <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:bg-blue-700 transition-colors">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                                FlowMeet <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono font-semibold">AI Suite</span>
                            </span>
                        </div>
                    </Link>

                    {/* Live Status Tag - Automattic / SRE Signal */}
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-700">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                        </span>
                        <span>Edge Router Operational (0.8ms latency)</span>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    <a href="#conversion" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                        Demand Conversion
                    </a>
                    <a href="#support-triage" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                        AI Support Triage
                    </a>
                    <a href="#architecture" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                        Polyglot Infra
                    </a>
                    <a href="#enablement-kpis" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                        RevOps KPIs
                    </a>
                    <Link href="/docs" className="text-sm font-mono font-medium text-slate-500 hover:text-slate-900 transition-colors">
                        API Docs
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-3">
                    <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors">
                        Sign in
                    </Link>
                    <a
                        href="#interactive-demo"
                        className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-blue-600 rounded-lg shadow-sm transition-all flex items-center gap-2"
                    >
                        <Activity className="w-4 h-4 text-blue-400 group-hover:text-white" />
                        <span>Test Live Engine</span>
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </nav>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-200 px-6 py-5 space-y-4 shadow-lg">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-700 w-fit">
                        <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                        <span>Edge Router Operational</span>
                    </div>
                    <div className="flex flex-col space-y-3">
                        <a
                            href="#conversion"
                            className="text-base font-medium text-slate-700 hover:text-blue-600"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Demand Conversion
                        </a>
                        <a
                            href="#support-triage"
                            className="text-base font-medium text-slate-700 hover:text-blue-600"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            AI Support Triage
                        </a>
                        <a
                            href="#architecture"
                            className="text-base font-medium text-slate-700 hover:text-blue-600"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Polyglot Infra
                        </a>
                        <a
                            href="#enablement-kpis"
                            className="text-base font-medium text-slate-700 hover:text-blue-600"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            RevOps KPIs
                        </a>
                        <Link
                            href="/docs"
                            className="text-base font-mono text-slate-500 hover:text-slate-900"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            API Docs
                        </Link>
                        <hr className="border-gray-200" />
                        <Link
                            href="/login"
                            className="text-base font-medium text-slate-600 hover:text-slate-900"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Sign in
                        </Link>
                        <a
                            href="#interactive-demo"
                            className="w-full text-center py-3 rounded-lg bg-slate-900 text-white font-semibold shadow-xs"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Test Live Engine
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}
