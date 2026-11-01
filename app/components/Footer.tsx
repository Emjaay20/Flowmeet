"use client";

import Link from "next/link";
import { GitBranch, ExternalLink } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-zinc-200/80 text-zinc-600 font-sans text-xs">
            <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
                
                {/* Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-zinc-100">
                    
                    {/* Brand & Mission */}
                    <div className="md:col-span-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-zinc-950 rounded-md flex items-center justify-center text-white font-editorial text-sm font-semibold">
                                F
                            </div>
                            <span className="font-editorial text-xl font-normal text-zinc-950 tracking-tight">
                                Flowmeet
                            </span>
                        </div>
                        <p className="text-zinc-500 text-xs leading-relaxed max-w-sm">
                            Deterministic inbound qualification, microsecond territory routing, and in-session meeting scheduling for engineering and RevOps teams.
                        </p>
                    </div>

                    {/* Column 1: Product */}
                    <div className="md:col-span-2 space-y-3">
                        <h4 className="text-[11px] font-mono font-semibold text-zinc-950 uppercase tracking-wider">
                            Product
                        </h4>
                        <ul className="space-y-2 text-xs text-zinc-600">
                            <li>
                                <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">
                                    How It Works
                                </a>
                            </li>
                            <li>
                                <a href="#career-matrix" className="hover:text-zinc-950 transition-colors">
                                    Rule Engine
                                </a>
                            </li>
                            <li>
                                <a href="#architecture" className="hover:text-zinc-950 transition-colors">
                                    Architecture
                                </a>
                            </li>
                            <li>
                                <a href="#pricing" className="hover:text-zinc-950 transition-colors">
                                    Pricing
                                </a>
                            </li>
                            <li>
                                <a href="#embed" className="hover:text-zinc-950 transition-colors">
                                    Embed Snippet
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 2: Engine */}
                    <div className="md:col-span-2 space-y-3">
                        <h4 className="text-[11px] font-mono font-semibold text-zinc-950 uppercase tracking-wider">
                            Services
                        </h4>
                        <ul className="space-y-2 text-xs text-zinc-600 font-mono">
                            <li>
                                <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">
                                    Rust Scraper (:8081)
                                </a>
                            </li>
                            <li>
                                <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">
                                    Go Concierge (:8082)
                                </a>
                            </li>
                            <li>
                                <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">
                                    Cal.com Handoff
                                </a>
                            </li>
                            <li>
                                <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">
                                    Python RAG (:8083)
                                </a>
                            </li>
                            <li>
                                <a href="#architecture" className="hover:text-zinc-950 transition-colors">
                                    Traefik Edge Proxy
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Solutions */}
                    <div className="md:col-span-2 space-y-3">
                        <h4 className="text-[11px] font-mono font-semibold text-zinc-950 uppercase tracking-wider">
                            Solutions
                        </h4>
                        <ul className="space-y-2 text-xs text-zinc-600">
                            <li>
                                <a href="#career-matrix" className="hover:text-zinc-950 transition-colors">
                                    Firecrawl (Scraping)
                                </a>
                            </li>
                            <li>
                                <a href="#career-matrix" className="hover:text-zinc-950 transition-colors">
                                    Chili Piper (Routing)
                                </a>
                            </li>
                            <li>
                                <a href="#career-matrix" className="hover:text-zinc-950 transition-colors">
                                    Luminovo (RAG Triage)
                                </a>
                            </li>
                            <li>
                                <a href="#pricing" className="hover:text-zinc-950 transition-colors">
                                    RevOps Pipeline
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Developers */}
                    <div className="md:col-span-2 space-y-3">
                        <h4 className="text-[11px] font-mono font-semibold text-zinc-950 uppercase tracking-wider">
                            Developers
                        </h4>
                        <ul className="space-y-2 text-xs text-zinc-600">
                            <li>
                                <Link href="/docs" className="hover:text-zinc-950 transition-colors">
                                    Architecture Docs
                                </Link>
                            </li>
                            <li>
                                <a 
                                    href="https://github.com/aetherhost/flowmeet" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-zinc-950 transition-colors inline-flex items-center gap-1"
                                >
                                    <span>GitHub Repository</span>
                                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                                </a>
                            </li>
                            <li>
                                <a href="#architecture" className="hover:text-zinc-950 transition-colors">
                                    Docker Compose
                                </a>
                            </li>
                            <li>
                                <Link href="/docs" className="hover:text-zinc-950 transition-colors">
                                    OpenAPI Spec
                                </Link>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-xs">
                    <div className="flex items-center gap-4">
                        <p>© {new Date().getFullYear()} Flowmeet. Open source under Apache-2.0.</p>
                        <span className="hidden sm:inline text-zinc-300">•</span>
                        <div className="flex items-center gap-1.5 text-zinc-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            <span>Systems operational</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-zinc-600">
                        <Link href="/privacy" className="hover:text-zinc-950 transition-colors">
                            Privacy
                        </Link>
                        <Link href="/terms" className="hover:text-zinc-950 transition-colors">
                            Terms
                        </Link>
                        <a 
                            href="https://github.com/aetherhost/flowmeet" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-zinc-950 transition-colors inline-flex items-center gap-1"
                        >
                            <GitBranch className="w-3.5 h-3.5" />
                            <span>GitHub</span>
                        </a>
                    </div>
                </div>

            </div>
        </footer>
    );
}
