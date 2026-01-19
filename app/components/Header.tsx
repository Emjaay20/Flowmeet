"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-200 shadow-sm">
            <nav className="max-w-[1200px] mx-auto flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg"></div>
                    <span className="text-xl font-bold text-gray-900">FlowMeet</span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
                    <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">How it works</a>
                    <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
                    <a href="#about" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">About</a>
                    <Link href="/docs" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">API</Link>
                    <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
                </div>

                <div className="hidden md:flex items-center gap-3">
                    <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 transition-colors">
                        Sign in
                    </Link>
                    <Link
                        href="/signup"
                        className="text-sm font-semibold text-white px-5 py-2.5 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 hover:opacity-90 transition-opacity"
                    >
                        Start free trial
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? (
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    ) : (
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    )}
                </button>
            </nav>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute top-full left-0 right-0 shadow-lg">
                    <div className="flex flex-col p-4 space-y-4">
                        <a
                            href="#features"
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Features
                        </a>
                        <a
                            href="#how-it-works"
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            How it works
                        </a>
                        <a
                            href="#pricing"
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Pricing
                        </a>
                        <a
                            href="#about"
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            About
                        </a>
                        <a
                            href="#contact"
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Contact
                        </a>
                        <hr className="border-gray-100" />
                        <Link
                            href="/login"
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/signup"
                            className="text-sm font-semibold text-center text-white px-5 py-2.5 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 hover:opacity-90 transition-opacity"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Start free trial
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
