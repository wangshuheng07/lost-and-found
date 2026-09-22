import { NextRequest, NextResponse } from "next/server";
import { searchQuerySchema, type PostResult } from "@/lib/schema";
import { getSupabaseServerClient } from "@/lib/supabase-server";

// GET /api/search?category=&keyword=&lng=&lat=&radiusMeters=&hours=
// Rule-based filter + sort against the posts table via the search_posts()
// SQL function. No AI/embeddings involved — see supabase/migrations/0001_init.sql.
//
// Uses the session-aware server client (not the anon-only one in
// src/lib/supabase.ts) so the signed-in user's session cookie rides along
// on the RPC call: search_posts() checks it's a verified @uwaterloo.ca
// email itself (0003_require_waterloo_auth_for_search.sql) — this route
// just surfaces whatever it says.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const numOrUndefined = (v: string | null) => (v === null || v === "" ? undefined : Number(v));

  const raw = {
    category: searchParams.get("category") ?? undefined,
    keyword: searchParams.get("keyword") ?? undefined,
    lng: numOrUndefined(searchParams.get("lng")),
    lat: numOrUndefined(searchParams.get("lat")),
    radiusMeters: numOrUndefined(searchParams.get("radiusMeters")),
    hours: numOrUndefined(searchParams.get("hours")),
  };

  const parsed = searchQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { category, keyword, lng, lat, radiusMeters, hours } = parsed.data;

  let supabase;
  try {
    supabase = await getSupabaseServerClient();
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server is not configured yet" }, { status: 500 });
  }

  const { data, error } = await supabase.rpc("search_posts", {
    p_category: category ?? null,
    p_keyword: keyword ?? null,
    p_lng: lng ?? null,
    p_lat: lat ?? null,
    p_radius_meters: radiusMeters,
    p_hours: hours ?? null,
  });

  if (error) {
    // 42501 = insufficient_privilege — search_posts()'s own "sign in with a
    // uwaterloo.ca email" check. Anything else is a real server error.
    if (error.code === "42501" || error.message?.includes("uwaterloo.ca")) {
      return NextResponse.json({ error: error.message, code: "unauthorized" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }

  type Row = {
    id: string;
    category: string;
    description: string;
    photo_url: string | null;
    location_label: string;
    found_at: string;
    contact_info: string;
    distance_meters: number | null;
  };

  const results: PostResult[] = ((data ?? []) as Row[]).map((row) => ({
    id: row.id,
    category: row.category as PostResult["category"],
    description: row.description,
    photoUrl: row.photo_url,
    locationLabel: row.location_label,
    foundAt: row.found_at,
    contactInfo: row.contact_info,
    distanceMeters: row.distance_meters,
  }));

  return NextResponse.json({ results });
}
