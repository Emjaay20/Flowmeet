import { createClient } from "@supabase/supabase-js";
import { createClient as createSessionClient } from "@/app/lib/supabase/server";

export function serviceDatabase() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
}

/** A workspace is derived from verified credentials, never from a body user_id. */
export async function authenticateWorkspace(req: Request) {
    const db = serviceDatabase();
    const apiKey = req.headers.get("x-api-key");
    if (apiKey) {
        const { data, error } = await db.from("api_keys").select("workspace_id").eq("key", apiKey).maybeSingle();
        return !error && data?.workspace_id ? { db, workspaceId: data.workspace_id as string } : null;
    }
    const bearer = req.headers.get("authorization")?.replace(/^Bearer /, "");
    const client = bearer ? db : await createSessionClient();
    const { data: { user }, error } = await client.auth.getUser(bearer || undefined);
    if (error || !user) return null;
    const { data: membership } = await db.from("workspace_users").select("workspace_id,role").eq("user_id", user.id).eq("role", "admin").order("created_at").limit(1).maybeSingle();
    return membership ? { db, workspaceId: membership.workspace_id as string } : null;
}
