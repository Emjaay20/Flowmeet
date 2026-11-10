"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

function LeadForm() {
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setStatus("");
        const form = e.currentTarget;
        const formData = {
            userId,
            name: (form.elements.namedItem("name") as HTMLInputElement).value,
            email: (form.elements.namedItem("email") as HTMLInputElement).value,
            company: (form.elements.namedItem("company") as HTMLInputElement).value,
            role: (form.elements.namedItem("role") as HTMLInputElement).value,
            region: (form.elements.namedItem("region") as HTMLSelectElement).value,
        };

        try {
            const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.qualified && data.bookingUrl) {
                window.location.href = data.bookingUrl;
            } else {
                setStatus("Thanks! Your submission was qualified and queued for routing.");
                form.reset();
                setLoading(false);
            }
        } catch (err) {
            setStatus("Unable to route at this moment. Please try again.");
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-[#fcfcf9] p-6 font-sans relative selection:bg-[#c8f944]">
            <Link
                href="/"
                className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-xs font-mono font-medium text-zinc-600 hover:text-zinc-950 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Flowmeet</span>
            </Link>

            <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-3xl border border-zinc-200/90 shadow-sm">
                <div className="text-center space-y-2">
                    <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center text-white font-editorial text-lg font-semibold mx-auto mb-2">
                        F
                    </div>
                    <h1 className="font-editorial text-3xl font-normal tracking-tight text-zinc-950">
                        Flowmeet Form Demo
                    </h1>
                    <p className="text-xs text-zinc-500 font-sans">
                        Simulate an inbound buyer submitting a standard web form
                    </p>
                </div>

                <form className="space-y-3.5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Alex Rivera"
                            className="block w-full rounded-xl border border-zinc-300 py-2.5 px-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 text-sm font-sans transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">Corporate Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="alex@stripe.com"
                            className="block w-full rounded-xl border border-zinc-300 py-2.5 px-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 text-sm font-sans transition-all"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">Company</label>
                            <input
                                type="text"
                                name="company"
                                placeholder="Stripe"
                                className="block w-full rounded-xl border border-zinc-300 py-2.5 px-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 text-sm font-sans transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">Role</label>
                            <input
                                type="text"
                                name="role"
                                placeholder="VP Eng"
                                className="block w-full rounded-xl border border-zinc-300 py-2.5 px-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 text-sm font-sans transition-all"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-mono font-medium text-zinc-700 mb-1">Region</label>
                        <select
                            name="region"
                            defaultValue=""
                            className="block w-full rounded-xl border border-zinc-300 py-2.5 px-3 text-zinc-900 bg-white focus:outline-none focus:border-zinc-950 text-sm font-sans transition-all"
                            required
                        >
                            <option value="" disabled>Select Region</option>
                            <option value="EMEA">EMEA (Europe, Middle East, Africa)</option>
                            <option value="NA">NA (North America)</option>
                            <option value="APAC">APAC (Asia-Pacific)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-zinc-950 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Qualifying lead...
                            </span>
                        ) : (
                            <>
                                <span>Submit &amp; Route</span>
                                <ArrowRight className="w-3.5 h-3.5 text-[#c8f944]" />
                            </>
                        )}
                    </button>
                </form>

                {status && (
                    <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-sans flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{status}</span>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function DemoPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#fcfcf9] flex items-center justify-center font-mono text-xs text-zinc-400">
                Loading demo...
            </div>
        }>
            <LeadForm />
        </Suspense>
    );
}
