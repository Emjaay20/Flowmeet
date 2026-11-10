"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Terminal } from "lucide-react";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#fcfcf9]/85 border-b border-zinc-200/80 transition-all">
            <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
                
                {/* Brand Logo */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-7 h-7 bg-zinc-950 rounded-lg flex items-center justify-center text-white font-editorial text-base font-semibold group-hover:bg-zinc-800 transition-colors">
                            F
                        </div>
                        <span className="text-lg font-bold tracking-tight text-zinc-950 font-sans">
                            Flowmeet
                        </span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-zinc-600">
                        <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">
                            How It Works
                        </a>
                        <a href="#architecture" className="hover:text-zinc-950 transition-colors">
                            Architecture
                        </a>
                        <a href="#pricing" className="hover:text-zinc-950 transition-colors">
                            Pricing
                        </a>
                        <a href="#embed" className="hover:text-zinc-950 transition-colors">
                            Embed
                        </a>
                        <Link href="/docs" className="hover:text-zinc-950 transition-colors flex items-center gap-1 font-mono text-xs">
                            <Terminal className="w-3.5 h-3.5" />
                            <span>Docs</span>
                        </Link>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-3">
                    <Link
                        href="/login"
                        className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 px-3.5 py-2 transition-colors"
                    >
                        Sign In
                    </Link>
                    <a
                        href="#interactive-demo"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-zinc-950 text-white hover:bg-zinc-800 shadow-xs transition-all cursor-pointer"
                    >
                        <span>Try Live Demo</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#c8f944]" />
                    </a>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-zinc-700 hover:text-zinc-950 focus:outline-none"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden border-b border-zinc-200 bg-[#fcfcf9] px-6 py-4 space-y-3 shadow-lg">
                    <a
                        href="#how-it-works"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-sm font-medium text-zinc-800 py-1 hover:text-zinc-950"
                    >
                        How It Works
                    </a>
                    <a
                        href="#architecture"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-sm font-medium text-zinc-800 py-1 hover:text-zinc-950"
                    >
                        Architecture
                    </a>
                    <a
                        href="#pricing"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-sm font-medium text-zinc-800 py-1 hover:text-zinc-950"
                    >
                        Pricing
                    </a>
                    <a
                        href="#embed"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-sm font-medium text-zinc-800 py-1 hover:text-zinc-950"
                    >
                        Embed Widget
                    </a>
                    <Link
                        href="/docs"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-sm font-medium text-zinc-800 py-1 hover:text-zinc-950"
                    >
                        Documentation
                    </Link>
                    <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
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
                            <span>Try Live Demo</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#c8f944]" />
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}
