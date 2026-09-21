import { NextRequest, NextResponse } from "next/server";
import { createPostSchema } from "@/lib/schema";
import { getSupabaseClient } from "@/lib/supabase";

// POST /api/posts — the finder's "post what you found" form submits here.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createPostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { category, description, photoUrl, lng, lat, locationLabel, foundAt, contactInfo } =
    parsed.data;

  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server is not configured yet" }, { status: 500 });
  }

  const { data, error } = await supabase.rpc("create_post", {
    p_category: category,
    p_description: description,
    p_photo_url: photoUrl ?? null,
    p_lng: lng,
    p_lat: lat,
    p_location_label: locationLabel,
    p_found_at: foundAt ?? new Date().toISOString(),
    p_contact_info: contactInfo,
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }

  return NextResponse.json({ id: data }, { status: 201 });
}
