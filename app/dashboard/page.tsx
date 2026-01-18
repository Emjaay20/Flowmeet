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

    // 1. Get User's Workspace
    const { data: workspaceUser } = await supabase
        .from("workspace_users")
        .select("workspace_id")
        .eq("user_id", session.user.id)
        .single();

    if (!workspaceUser) {
        // Handle case where user has no workspace (e.g. new signup error)
        return <AdminClient leads={[]} metrics={{ totalLeads: 0, qualifiedLeads: 0, conversionRate: '0' }} apiKey={null} initialBookingUrl="" />
    }

    const { workspace_id } = workspaceUser;

    // 2. Fetch Leads for THIS Workspace Only
    const { data: leads } = await supabase
        .from("Lead")
        .select("*")
        .eq("workspace_id", workspace_id) // CRITICAL: Filter by workspace
        .order('created_at', { ascending: false });

    // 3. Fetch API Key & Settings for THIS Workspace
    let apiKey = null;
    let bookingUrl = "";

    // Fetch API Key
    const { data: keyData } = await supabase
        .from("api_keys")
        .select("key")
        .eq("workspace_id", workspace_id)
        .single();
    apiKey = keyData?.key || null;

    // Fetch Workspace Settings
    const { data: workspaceData } = await supabase
        .from("workspaces")
        .select("booking_url")
        .eq("id", workspace_id)
        .single();
    bookingUrl = workspaceData?.booking_url || "";

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

    return <AdminClient leads={allLeads} metrics={metrics} apiKey={apiKey} initialBookingUrl={bookingUrl} />
}
