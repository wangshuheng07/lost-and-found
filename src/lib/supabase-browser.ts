"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Browser-side client (persists the session in cookies via @supabase/ssr,
// so it and src/lib/supabase-server.ts — used by Route Handlers like
// /api/search — see the same session). Separate from src/lib/supabase.ts,
// which is the anon-key-only client used for the create_post RPC and never
// carries a user session.
let client: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Copy .env.local.example to .env.local and fill in your Supabase project's values."
    );
  }

  client = createBrowserClient(url, anonKey);
  return client;
}
