import Link from "next/link";

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-3xl mx-auto bg-white p-10 rounded-xl shadow-sm ring-1 ring-slate-900/5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">API Documentation</h1>
                    <Link href="/dashboard" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
                        &larr; Back to Dashboard
                    </Link>
                </div>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Introduction</h2>
                        <p className="text-slate-600 leading-relaxed">
                            The FlowMeet API allows you to submit leads programmatically from your own website, mobile app, or backend service.
                            Authenticated requests will be automatically routed to your workspace and scored by our AI engine.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Authentication</h2>
                        <p className="text-slate-600 mb-4">
                            Requests are authenticated via the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800">x-api-key</code> header.
                            You can find your API key in the <Link href="/dashboard" className="text-blue-600 underline">Dashboard</Link>.
                        </p>
                        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                            <code className="text-sm font-mono text-slate-200">
                                x-api-key: cp_live_12345...
                            </code>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Submit a Lead</h2>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold font-mono">POST</span>
                            <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono text-slate-800">https://your-site.com/api/leads</code>
                        </div>

                        <h3 className="text-sm font-semibold text-slate-900 mb-2 mt-6">Request Body (JSON)</h3>
                        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-sm font-mono text-blue-300">
                                {`{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "company": "Acme Corp",
  "role": "CTO",
  "region": "NA"
}`}
                            </pre>
                        </div>

                        <h3 className="text-sm font-semibold text-slate-900 mb-2 mt-6">Example (cURL)</h3>
                        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-sm font-mono text-slate-200">
                                {`curl -X POST https://flowmeet.vercel.app/api/leads \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "name": "John Smith",
    "email": "john@tech.com",
    "company": "TechGlobal",
    "role": "Director of Engineering",
    "region": "EMEA"
  }'`}
                            </pre>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
