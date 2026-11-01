"use client";

import Link from "next/link";
import { Terminal, Shield, Cpu, ExternalLink, GitBranch, Heart } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-zinc-200/90 text-zinc-600 font-sans text-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-zinc-200/80">
                    
                    {/* Brand & Systems Overview */}
                    <div className="md:col-span-5 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-editorial text-lg font-bold">
                                F
                            </div>
                            <span className="font-editorial text-2xl font-normal text-zinc-950 tracking-tight">
                                Flowmeet
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[#c8f944] text-zinc-950 font-mono text-[10px] font-bold">
                                v2.4 PROD
                            </span>
                        </div>

                        <p className="text-zinc-600 text-sm leading-relaxed max-w-sm">
                            Deterministic revenue acceleration and technical enablement super-engine. Polyglot microservices engineered for sub-50ms execution on lightweight 1GB edge nodes.
                        </p>

                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 pt-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>NODE STATUS: 194.163.172.101 • ALL SYSTEMS HEALTHY</span>
                        </div>
                    </div>

                    {/* Nav Links Column 1: Architecture */}
                    <div className="md:col-span-2 space-y-3">
                        <h4 className="font-mono text-[11px] font-bold text-zinc-950 uppercase tracking-wider">
                            ARCHITECTURE
                        </h4>
                        <ul className="space-y-2 font-mono text-xs text-zinc-600">
                            <li>
                                <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">
                                    01. Rust Crawler (:8081)
                                </a>
                            </li>
                            <li>
                                <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">
                                    02. Go Concierge (:8082)
                                </a>
                            </li>
                            <li>
                                <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">
                                    03. Cal.com Native Handoff
                                </a>
                            </li>
                            <li>
                                <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">
                                    04. Python RAG Brain (:8083)
                                </a>
                            </li>
                            <li>
                                <a href="#architecture" className="hover:text-zinc-950 transition-colors">
                                    Traefik Edge Routing
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Nav Links Column 2: Recruiter Matrix */}
                    <div className="md:col-span-2 space-y-3">
                        <h4 className="font-mono text-[11px] font-bold text-zinc-950 uppercase tracking-wider">
                            TEAMS &amp; MATRIX
                        </h4>
                        <ul className="space-y-2 font-mono text-xs text-zinc-600">
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
                                    RevOps Success Fee
                                </a>
                            </li>
                            <li>
                                <Link href="/docs" className="hover:text-zinc-950 transition-colors">
                                    Architecture Docs
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Nav Links Column 3: Telemetry & Endpoints */}
                    <div className="md:col-span-3 space-y-3">
                        <h4 className="font-mono text-[11px] font-bold text-zinc-950 uppercase tracking-wider">
                            LIVE TELEMETRY
                        </h4>
                        <div className="p-3.5 rounded-xl bg-zinc-950 text-white font-mono text-[11px] space-y-1.5 border border-zinc-800">
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Rust Scrape:</span>
                                <span className="text-[#c8f944]">245ms</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Go Routing:</span>
                                <span className="text-[#c8f944]">14ms</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Python RAG:</span>
                                <span className="text-[#c8f944]">410ms</span>
                            </div>
                            <div className="flex justify-between border-t border-zinc-800 pt-1 text-[10px]">
                                <span className="text-zinc-500">Active RAM:</span>
                                <span className="text-emerald-400">130MB / 1024MB</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar: Copyright & Systems Disclosure */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-xs">
                    <p className="font-mono text-[11px]">
                        © {new Date().getFullYear()} Flowmeet Engine • Built by Yusuf Abubakar. Apache-2.0 Open Source.
                    </p>
                    <div className="flex items-center gap-6 font-mono text-[11px]">
                        <Link href="/privacy" className="hover:text-zinc-900 transition-colors">
                            Privacy
                        </Link>
                        <Link href="/terms" className="hover:text-zinc-900 transition-colors">
                            Terms
                        </Link>
                        <a 
                            href="https://github.com/aetherhost/flowmeet" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-zinc-900 transition-colors flex items-center gap-1"
                        >
                            <GitBranch className="w-3.5 h-3.5" />
                            <span>GitHub Source</span>
                        </a>
                    </div>
                </div>

            </div>
        </footer>
    );
}
