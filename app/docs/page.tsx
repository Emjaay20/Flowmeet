
import React from 'react';
import Header from '../components/Header';
import Link from 'next/link';

export const metadata = {
    title: 'API Documentation - FlowMeet',
    description: 'Integrate FlowMeet into your application with our simple API.',
};

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Header />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">

                    {/* Intro */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">FlowMeet API Documentation</h1>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Welcome to the FlowMeet API. This API allows you to programmatically submit leads from your own applications,
                            websites, or CRMs directly into your FlowMeet workspace. It supports auto-enrichment, AI scoring, and automatic routing.
                        </p>
                    </div>

                    <div className="space-y-12">

                        {/* Section 1: Authentication */}
                        <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-600 rounded-lg px-2 py-1 text-sm">1</span>
                                Authentication
                            </h2>
                            <p className="text-slate-600 mb-6">
                                All API requests must be authenticated using your workspace <strong>API Key</strong>.
                                You can find this key in your <Link href="/dashboard" className="text-blue-600 hover:underline">Dashboard Settings</Link>.
                            </p>

                            <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto text-sm text-slate-300 font-mono">
                                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Header</p>
                                <div>x-api-key: <span className="text-green-400">YOUR_API_KEY</span></div>
                            </div>
                        </section>

                        {/* Section 2: Endpoints */}
                        <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="bg-purple-100 text-purple-600 rounded-lg px-2 py-1 text-sm">2</span>
                                Endpoints
                            </h2>

                            {/* POST /api/leads */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded text-sm">POST</span>
                                    <code className="text-lg font-mono text-slate-800">/api/leads</code>
                                </div>
                                <p className="text-slate-600 mb-4">
                                    Creates a new lead in your workspace. The lead will be automatically scored by AI and enriched if enabled.
                                </p>

                                <h3 className="font-semibold text-slate-900 mb-2">Request Body</h3>
                                <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto text-sm text-slate-100 font-mono mb-6">
                                    <pre>{`{
  "name": "John Doe",           // Required
  "email": "john@example.com",  // Required
  "company": "Tech Corp",       // Optional (Recommended for enrichment)
  "role": "CTO",                // Optional (Used for scoring)
  "region": "NA"                // Optional (NA, EMEA, APAC, LATAM)
}`}</pre>
                                </div>

                                <h3 className="font-semibold text-slate-900 mb-2">Success Response (200 OK)</h3>
                                <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto text-sm text-slate-100 font-mono">
                                    <pre>{`{
  "success": true,
  "qualified": true,
  "bookingUrl": "https://calendly.com/your-link",
  "lead": {
    "id": "lead_12345",
    "ai_score": 0.95,
    "status": "Qualified",
    ...
  }
}`}</pre>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Error Codes */}
                        <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="bg-red-100 text-red-600 rounded-lg px-2 py-1 text-sm">3</span>
                                Errors
                            </h2>

                            <div className="overflow-hidden rounded-lg border border-slate-200">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-red-600">400 Bad Request</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">Missing required fields (name or email).</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-red-600">401 Unauthorized</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">Missing or invalid API Key.</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-red-600">500 Server Error</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">Internal system error.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                    </div>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-slate-200 py-12 bg-white">
                <div className="max-w-4xl mx-auto px-6 text-center text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} FlowMeet. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
