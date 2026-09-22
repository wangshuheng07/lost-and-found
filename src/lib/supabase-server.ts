import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

// Server-side client for Route Handlers, backed by the session cookie
// @supabase/ssr sets for the browser client. Unlike src/lib/supabase.ts
// (anon-only, no user session), this one carries whichever user is signed
// in — so RPCs made through it are subject to the search_posts() auth.email()
// check in supabase/migrations/0003_require_waterloo_auth_for_search.sql.
export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Copy .env.local.example to .env.local and fill in your Supabase project's values."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        // Route Handlers can write cookies; Server Components (read-only
        // rendering) can't, and this throws there — caught and ignored,
        // matching Supabase's documented Next.js App Router pattern, since
        // middleware.ts is what actually keeps the session cookie fresh.
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // ignore — called from a context that can't set cookies
        }
      },
    },
  });
}
