"use client";

import { useState } from "react";

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
    metrics
}: {
    leads: any[];
    metrics: {
        totalLeads: number;
        qualifiedLeads: number;
        conversionRate: string;
    };
}) {
    const [filter, setFilter] = useState("All");

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
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Leads</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Manage and track your inbound leads and their qualification status.
                        </p>
                    </div>
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
            </div>
        </main>
    );
}

