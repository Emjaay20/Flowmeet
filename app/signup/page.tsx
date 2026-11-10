"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const cleanEmail = email.trim().toLowerCase();
        const { data, error: signUpError } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        // Supabase returns user with empty identities when email already exists (enumeration defense)
        if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
            setError("An account with this email already exists. Please sign in instead.");
            setLoading(false);
            return;
        }

        try {
            // Call onboarding to attach workspace & API key
            const res = await fetch("/api/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: data.user?.id,
                    email: data.user?.email || cleanEmail,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Onboarding setup failed");
            }

            setLoading(false);
            router.refresh();
            window.location.href = "/dashboard";
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred during account creation");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#fcfcf9] px-4 py-12 sm:px-6 lg:px-8 font-sans relative selection:bg-[#c8f944]">
            <Link
                href="/"
                className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-xs font-mono font-medium text-zinc-600 hover:text-zinc-950 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Flowmeet</span>
            </Link>

            <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-3xl border border-zinc-200/90 shadow-sm">
                <div className="text-center space-y-2">
                    <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center text-white font-editorial text-lg font-semibold mx-auto mb-2">
                        F
                    </div>
                    <h2 className="font-editorial text-3xl font-normal tracking-tight text-zinc-950">
                        Create an account
                    </h2>
                    <p className="text-xs text-zinc-500 font-sans">
                        Start managing inbound routing and instant scheduling
                    </p>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleSignup}>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="email" className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="block w-full rounded-xl border border-zinc-300 py-2.5 px-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 text-sm font-sans transition-all"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="block w-full rounded-xl border border-zinc-300 py-2.5 px-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 text-sm font-sans transition-all"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 space-y-2">
                            <p className="font-medium">{error}</p>
                            {error.includes("already exists") && (
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <span>Sign in to your account</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-zinc-950 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Creating account...
                            </span>
                        ) : (
                            <>
                                <span>Create account</span>
                                <ArrowRight className="w-3.5 h-3.5 text-[#c8f944]" />
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-zinc-500 pt-2">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-zinc-900 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
