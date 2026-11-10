"use client";

import Link from "next/link";
import { GitBranch, ExternalLink } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-zinc-200/80 text-zinc-600 font-sans text-xs">
            <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
                
                {/* Main Row */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-zinc-100">
                    
                    {/* Brand */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-zinc-950 rounded-md flex items-center justify-center text-white font-editorial text-sm font-semibold">
                                F
                            </div>
                            <span className="font-editorial text-xl font-normal text-zinc-950 tracking-tight">
                                Flowmeet
                            </span>
                        </div>
                        <p className="text-zinc-500 text-xs leading-relaxed max-w-md">
                            Self-hosted inbound qualification, microsecond territory routing, and in-session Cal.com scheduling.
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-600 font-medium">
                        <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">
                            Pipeline
                        </a>
                        <a href="#architecture" className="hover:text-zinc-950 transition-colors">
                            Benchmarks
                        </a>
                        <a href="#pricing" className="hover:text-zinc-950 transition-colors">
                            Self-Host
                        </a>
                        <a href="#embed" className="hover:text-zinc-950 transition-colors">
                            Embed
                        </a>
                        <Link href="/docs" className="hover:text-zinc-950 transition-colors font-mono">
                            Docs
                        </Link>
                        <a 
                            href="https://github.com/Emjaay20/Flowmeet" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-zinc-950 transition-colors inline-flex items-center gap-1"
                        >
                            <span>GitHub</span>
                            <ExternalLink className="w-3 h-3 text-zinc-400" />
                        </a>
                    </div>

                </div>

                {/* Bottom Bar: Built by Yusuf Abubakar */}
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-xs">
                    <p>
                        © {new Date().getFullYear()} Flowmeet. Open source under the MIT License.
                    </p>

                    <div className="flex items-center gap-4 text-zinc-700">
                        <span>Built by <strong className="text-zinc-900 font-semibold">Yusuf Abubakar</strong></span>
                        <span className="text-zinc-300">•</span>
                        <a
                            href="https://github.com/Emjaay20"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-zinc-950 transition-colors inline-flex items-center gap-1 font-medium"
                        >
                            <GitBranch className="w-3.5 h-3.5" />
                            <span>GitHub</span>
                        </a>
                        <span className="text-zinc-300">•</span>
                        <a
                            href="https://www.linkedin.com/in/yusuf-abubakar-12822a190/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-zinc-950 transition-colors inline-flex items-center gap-1.5 font-medium"
                        >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z" />
                            </svg>
                            <span>LinkedIn</span>
                        </a>
                    </div>
                </div>

            </div>
        </footer>
    );
}
