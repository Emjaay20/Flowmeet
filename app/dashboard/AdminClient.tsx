"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";

function Metric({ title, value }: { title: string; value: string | number }) {
    return (
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 border-l-4 border-l-amber-400">
            <dt className="text-sm font-medium text-slate-500">{title}</dt>
            <dd className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</dd>
        </div>
    )
}

export default function AdminClient({
    leads,
    metrics,
    apiKey,
    initialBookingUrl
}: {
    leads: any[];
    metrics: {
        totalLeads: number;
        qualifiedLeads: number;
        conversionRate: string;
    };
    apiKey: string | null;
    initialBookingUrl: string;
}) {
    const [filter, setFilter] = useState("All");
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState("Leads");
    const [bookingUrl, setBookingUrl] = useState(initialBookingUrl);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const copyToClipboard = () => {
        if (apiKey) {
            navigator.clipboard.writeText(apiKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const saveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingUrl })
            });
            if (!res.ok) throw new Error('Failed to save settings');
            alert('Settings saved successfully!');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    const filteredLeads =
        filter === "All" ? leads : leads.filter((l) => {
            if (filter === "Qualified") return l.qualified;
            if (filter === "Unqualified") return !l.qualified;
            return true;
        });

    return (
        <main className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Manage and track your inbound leads and their qualification status.
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
                    >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                        Sign out
                    </button>
                </div>

                {/* Navigation Tabs (Pill Style) */}
                <div className="flex justify-center">
                    <div className="inline-flex rounded-lg bg-slate-100 p-1">
                        <button
                            onClick={() => setActiveTab("Leads")}
                            className={`${activeTab === "Leads"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                } rounded-md px-6 py-2.5 text-sm font-medium transition-all duration-200`}
                        >
                            Leads
                        </button>
                        <button
                            onClick={() => setActiveTab("Settings")}
                            className={`${activeTab === "Settings"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                } rounded-md px-6 py-2.5 text-sm font-medium transition-all duration-200`}
                        >
                            Settings
                        </button>
                    </div>
                </div>

                {/* TAB CONTENT: LEADS */}
                {activeTab === "Leads" && (
                    <>
                        <div className="flex items-center gap-4">
                            {/* Filter Buttons */}
                            <div className="inline-flex rounded-md shadow-sm" role="group">
                                <button
                                    type="button"
                                    onClick={() => setFilter("All")}
                                    className={`px-4 py-2 text-sm font-medium border rounded-l-lg transition-colors ${filter === "All"
                                        ? "bg-slate-900 text-white border-slate-900"
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilter("Qualified")}
                                    className={`px-4 py-2 text-sm font-medium border-t border-b transition-colors ${filter === "Qualified"
                                        ? "bg-slate-900 text-white border-slate-900"
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                        }`}
                                >
                                    Qualified
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilter("Unqualified")}
                                    className={`px-4 py-2 text-sm font-medium border rounded-r-lg transition-colors ${filter === "Unqualified"
                                        ? "bg-slate-900 text-white border-slate-900"
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                        }`}
                                >
                                    Unqualified
                                </button>
                            </div>

                            <span className="hidden sm:inline-flex items-center rounded-md bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-inset ring-slate-300">
                                Total: {filteredLeads.length}
                            </span>
                        </div>

                        {/* Metrics Section - 3 Cards in One Row */}
                        <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
                            <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #f59e0b' }}>
                                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Total Leads</p>
                                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{metrics.totalLeads}</p>
                            </div>
                            <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #f59e0b' }}>
                                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Qualified Leads</p>
                                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{metrics.qualifiedLeads}</p>
                            </div>
                            <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #f59e0b' }}>
                                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Conversion Rate</p>
                                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{metrics.conversionRate}%</p>
                            </div>
                        </div>

                        {/* Table Container */}
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Company</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Region</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">AI Score</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">AI Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {filteredLeads.map((lead) => (
                                            <tr key={lead.id} className="transition-colors hover:bg-slate-50/80">
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-900">{lead.name}</span>
                                                        <span className="text-xs text-slate-500">{lead.email}</span>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-slate-700">{lead.company}</span>
                                                        <span className="text-xs text-slate-400">{lead.role}</span>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className="text-sm text-slate-600">{lead.region}</span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${lead.qualified
                                                        ? 'bg-green-50 text-green-700 ring-green-600/20'
                                                        : 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                                                        }`}>
                                                        {lead.qualified ? 'Qualified' : 'Unqualified'}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right">
                                                    {lead.booking_url ? (
                                                        <a href={lead.booking_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline">
                                                            Open Link
                                                        </a>
                                                    ) : (
                                                        <span className="text-sm text-slate-400">—</span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right">
                                                    <span className="text-sm text-slate-600">
                                                        {typeof lead.ai_score === 'number' ? lead.ai_score.toFixed(2) : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right">
                                                    <span className="text-sm text-slate-600">{lead.ai_reason}</span>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredLeads.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                                                    No leads found matching current filter.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* TAB CONTENT: SETTINGS */}
                {activeTab === "Settings" && (
                    <div className="space-y-6">
                        {/* API Key Section (Moved from Leads Tab) */}
                        <div className="bg-white p-6 rounded-xl shadow-sm ring-1 ring-slate-900/5">
                            <h3 className="text-base font-semibold leading-7 text-slate-900">Developer Settings</h3>
                            <div className="mt-2 max-w-xl">
                                <p className="text-sm text-slate-500">Use this API key to send leads securely from your own website.</p>
                                <div className="mt-4 flex items-center gap-x-4">
                                    <code className="rounded bg-slate-100 px-3 py-2 text-sm font-mono text-slate-800 break-all">
                                        {apiKey || "No API Key found"}
                                    </code>
                                    <button
                                        type="button"
                                        onClick={copyToClipboard}
                                        className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                                    >
                                        {copied ? "Copied!" : "Copy"}
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-slate-400">
                                    Endpoint: <span className="font-mono">POST /api/leads</span>
                                </p>
                            </div>
                        </div>

                        {/* General Settings */}
                        <div className="bg-white p-6 rounded-xl shadow-sm ring-1 ring-slate-900/5">
                            <h3 className="text-lg font-medium leading-6 text-slate-900">General Settings</h3>
                            <form onSubmit={saveSettings} className="mt-6 max-w-xl space-y-6">
                                <div>
                                    <label htmlFor="bookingUrl" className="block text-sm font-medium leading-6 text-slate-900">
                                        Booking Link
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            type="url"
                                            name="bookingUrl"
                                            id="bookingUrl"
                                            className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                            placeholder="https://calendly.com/your-link"
                                            value={bookingUrl}
                                            onChange={(e) => setBookingUrl(e.target.value)}
                                        />
                                    </div>
                                    <p className="mt-2 text-sm text-slate-500">
                                        This link will be sent to qualified leads automatically.
                                    </p>
                                </div>
                                <div className="flex items-center justify-end gap-x-6">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-md bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-colors"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
