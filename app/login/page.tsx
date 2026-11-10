'use client'

import { useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const cleanEmail = email.trim().toLowerCase()
        const { error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.refresh()
            window.location.href = '/dashboard'
        }
    }

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
                        Sign in to Flowmeet
                    </h2>
                    <p className="text-xs text-zinc-500 font-sans">
                        Access your inbound routing dashboard and CRM settings
                    </p>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="email" className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full rounded-xl border border-zinc-300 py-2.5 px-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 text-sm font-sans transition-all"
                                placeholder="name@company.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-xs font-mono font-medium text-zinc-700 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full rounded-xl border border-zinc-300 py-2.5 px-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 text-sm font-sans transition-all"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
                            {error}
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
                                Signing in...
                            </span>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight className="w-3.5 h-3.5 text-[#c8f944]" />
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-zinc-500 pt-2">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="font-semibold text-zinc-900 hover:underline">
                            Create account
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
