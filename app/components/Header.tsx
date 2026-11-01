"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Menu, X, ArrowRight, ExternalLink, Terminal } from "lucide-react";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-[100] glass-nav border-b border-zinc-200/80 transition-all">
            <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3.5">
                {/* Brand & Version Badge */}
                <div className="flex items-center gap-4 sm:gap-6">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center text-white shadow-xs group-hover:bg-zinc-800 transition-colors">
                            <Sparkles className="w-4 h-4 text-[#c8f944]" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold tracking-tight text-zinc-950 font-sans">
                                Flowmeet
                            </span>
                            <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#c8f944] text-zinc-950 border border-zinc-900/10 shadow-xs">
                                v2.4 PROD
                            </span>
                        </div>
                    </Link>

                    {/* VPS Live Badge */}
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-mono text-emerald-800">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                        </span>
                        <span>VPS Gateway: 0.8ms • 132MB/1GB RAM</span>
                    </div>
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex items-center gap-7 text-[13px] font-medium text-zinc-600">
                    <a href="#core-loop" className="hover:text-zinc-950 transition-colors">
                        Core Loop
                    </a>
                    <a href="#rule-builder" className="hover:text-zinc-950 transition-colors">
                        Rule Engine
                    </a>
                    <a href="#career-pitch" className="hover:text-zinc-950 transition-colors">
                        Why We Built This
                    </a>
                    <a href="#polyglot-infra" className="hover:text-zinc-950 transition-colors">
                        Polyglot Infra
                    </a>
                    <a href="#pricing" className="hover:text-zinc-950 transition-colors">
                        Pricing
                    </a>
                    <Link href="/docs" className="hover:text-zinc-950 transition-colors flex items-center gap-1 font-mono text-xs">
                        <Terminal className="w-3.5 h-3.5" />
                        Docs
                    </Link>
                </div>

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-3">
                    <Link
                        href="/login"
                        className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 px-3 py-2 transition-colors"
                    >
                        Sign In
                    </Link>
                    <a
                        href="#interactive-demo"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-zinc-950 text-white hover:bg-zinc-800 shadow-sm transition-all"
                    >
                        <span>Live Demo</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#c8f944]" />
                    </a>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-zinc-700 hover:text-zinc-950"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden border-b border-zinc-200 bg-white px-6 py-4 space-y-3 shadow-lg">
                    <a
                        href="#core-loop"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-sm font-medium text-zinc-800 py-1"
                    >
                        Core Loop
                    </a>
                    <a
                        href="#rule-builder"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-sm font-medium text-zinc-800 py-1"
                    >
                        Rule Engine
                    </a>
                    <a
                        href="#career-pitch"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-sm font-medium text-zinc-800 py-1"
                    >
                        Why We Built This
                    </a>
                    <a
                        href="#polyglot-infra"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-sm font-medium text-zinc-800 py-1"
                    >
                        Polyglot Infra
                    </a>
                    <a
                        href="#pricing"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-sm font-medium text-zinc-800 py-1"
                    >
                        Pricing
                    </a>
                    <Link
                        href="/docs"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-sm font-medium text-zinc-800 py-1"
                    >
                        Docs &amp; Architecture
                    </Link>
                    <div className="pt-2 border-t border-zinc-100 flex items-center gap-3">
                        <Link
                            href="/login"
                            className="text-xs font-semibold text-zinc-700 py-2"
                        >
                            Sign In
                        </Link>
                        <a
                            href="#interactive-demo"
                            onClick={() => setIsMenuOpen(false)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-zinc-950 text-white"
                        >
                            <span>Live Demo</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#c8f944]" />
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}
