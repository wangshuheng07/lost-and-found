import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazy singleton: we do NOT create the client at module load time, so
// `next build` never fails just because .env.local isn't filled in yet.
// The error only surfaces when a route handler actually runs without the
// env vars set.
let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Copy .env.local.example to .env.local and fill in your Supabase project's values."
    );
  }

  // The anon key is enough here: posts is RLS-locked with no public
  // policies, so all reads/writes are mediated by the SECURITY DEFINER
  // functions (create_post / search_posts) — see the migration file.
  client = createClient(url, anonKey, { auth: { persistSession: false } });
  return client;
}
