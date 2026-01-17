import AdminClient from "./AdminClient";
import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'

export default async function AdminPage({
    searchParams,
}: {
    searchParams: { filter?: string }
}) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        redirect('/login')
    }

    const { data: leads } = await supabase
        .from("Lead")
        .select("*")
        .order('created_at', { ascending: false });

    const allLeads = leads || []
    const totalLeads = allLeads.length
    const qualifiedLeads = allLeads.filter((l) => l.qualified).length
    const conversionRate = totalLeads > 0
        ? ((qualifiedLeads / totalLeads) * 100).toFixed(1)
        : '0'

    const metrics = {
        totalLeads,
        qualifiedLeads,
        conversionRate
    }

    return <AdminClient leads={allLeads} metrics={metrics} />
}
