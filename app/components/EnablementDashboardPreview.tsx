import { BarChart3, TrendingUp, Users, DollarSign, Zap, Bot, ArrowUpRight, ShieldCheck, Briefcase, Award } from "lucide-react";

export default function EnablementDashboardPreview() {
    const kpis = [
        {
            label: "Enrichment & Routing Speed",
            value: "< 1.2 Secs",
            change: "Real-Time Pipeline",
            comparison: "Live DOM scraping & microsecond Go routing",
            icon: <Zap className="w-5 h-5 text-amber-600" />,
            color: "border-amber-200 bg-amber-50 text-amber-800",
            valColor: "text-slate-900"
        },
        {
            label: "Level-1 Support Deflection",
            value: "84.7%",
            change: "Zero Human Lag",
            comparison: "Resolved autonomously via Python RAG (<2ms)",
            icon: <Bot className="w-5 h-5 text-indigo-600" />,
            color: "border-indigo-200 bg-indigo-50 text-indigo-800",
            valColor: "text-slate-900"
        },
        {
            label: "Total System RAM Footprint",
            value: "~132 MB",
            change: "Oracle VPS Optimized",
            comparison: "4 isolated polyglot microservices in production",
            icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
            color: "border-emerald-200 bg-emerald-50 text-emerald-800",
            valColor: "text-slate-900"
        }
    ];

    const monetizationPivots = [
        {
            title: "Usage-Based SaaS API",
            desc: "Charge developers & B2B teams per scraping call, RAG query, or intent scoring event handled by our Edge proxy.",
            price: "From $0.005 / execution",
            badge: "API Metered"
        },
        {
            title: "Success-Fee RevOps Model",
            desc: "Zero retainer upfront. Clients pay a fixed commission only when an enterprise buyer completes an automated meeting with an AE.",
            price: "$75 - $150 / booked demo",
            badge: "High-Ticket B2B"
        },
        {
            title: "White-Label Agency License",
            desc: "Agencies and consultants rebrand our entire polyglot suite under their own domain name to offer turnkey demand conversion to their clients.",
            price: "$499 / month flat tier",
            badge: "Most Lucrative"
        }
    ];

    return (
        <section id="enablement-kpis" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-semibold mb-4">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>REVOPS & PRODUCT ENABLEMENT METRICS</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Proof of Impact for <span className="text-blue-600">Modern Revenue Teams</span>
                </h2>
                <p className="mt-4 text-slate-600 text-lg sm:text-xl">
                    Why high-performing product and revenue specialists rely on FlowMeet to automate customer touchpoints and uncover actionable revenue telemetry.
                </p>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md relative overflow-hidden flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-mono uppercase font-semibold text-slate-500 tracking-wider">{kpi.label}</span>
                                <div className="p-2.5 rounded-lg bg-slate-50 border border-gray-200">
                                    {kpi.icon}
                                </div>
                            </div>
                            <div className={`text-4xl font-extrabold tracking-tight font-mono mb-2 ${kpi.valColor}`}>
                                {kpi.value}
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className={`inline-block text-xs font-semibold px-2 py-0.5 rounded border mb-1 font-mono ${kpi.color}`}>
                                ↗ {kpi.change}
                            </div>
                            <div className="text-xs text-slate-500">
                                {kpi.comparison}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Enablement Showcase Banner */}
            <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 relative overflow-hidden shadow-xl">
                <div className="max-w-2xl relative z-10">
                    <div className="inline-flex items-center gap-2 text-blue-400 text-sm font-bold tracking-wide uppercase mb-3 font-mono">
                        <Award className="w-4 h-4 text-blue-400" />
                        Luminovo Product Enablement Inspired
                    </div>
                    <h3 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                        The Bridge Between Engineering & Client Conversion
                    </h3>
                    <p className="mt-4 text-slate-300 leading-relaxed text-sm sm:text-base">
                        In enterprise B2B software, customer education and sales velocity are often siloed. FlowMeet acts as an automated enablement specialist—simultaneously running technical onboarding, documentation RAG triage, and instantaneous meetings for high-intent prospects.
                    </p>
                    
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                            <h4 className="font-semibold text-white text-sm mb-1">Live Telemetry Synchronizer</h4>
                            <p className="text-xs text-slate-400 leading-normal">Pushes firmographic metrics and ticket deflection logs straight to Slack & HubSpot instantly.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                            <h4 className="font-semibold text-white text-sm mb-1">Zero Manual Triaging</h4>
                            <p className="text-xs text-slate-400 leading-normal">Engineers stay focused on code while Edge AI answers Level-1 inquiries 24/7 without delays.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monetization / Use Case Matrix */}
            <div className="mt-20">
                <div className="text-center mb-10">
                    <h3 className="text-2xl font-bold text-slate-900">Multi-Engine Monetization Strategy</h3>
                    <p className="text-sm text-slate-600 mt-1">How you turn this engineering powerhouse into a scalable revenue-generating business</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {monetizationPivots.map((plan, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-blue-500 transition-all flex flex-col justify-between shadow-xs">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                        {plan.badge}
                                    </span>
                                    <Briefcase className="w-4 h-4 text-slate-400" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900">{plan.title}</h4>
                                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{plan.desc}</p>
                            </div>
                            <div className="pt-4 mt-6 border-t border-gray-100 flex items-center justify-between">
                                <span className="font-mono text-sm font-bold text-slate-900">{plan.price}</span>
                                <span className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer flex items-center gap-0.5">
                                    Deploy model <ArrowUpRight className="w-3.5 h-3.5" />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
