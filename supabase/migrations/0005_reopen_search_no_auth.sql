-- Drop the sign-in requirement on search_posts entirely — back to how it
-- was in 0001, before 0003/0004. This isn't a reversal of "contact info
-- should eventually be protected somehow" (see the note at the bottom of
-- this file and README's "Next up" list) — it's picking priorities for
-- this week's Demo 1, which needs a presentation, product screens, and a
-- timeline, not a working sign-in flow. The email-code sign-in UI
-- (src/app/login/page.tsx, AuthProvider, etc.) is left in place, just
-- unused for now — easy to re-wire once SMTP delivery is sorted out.
create or replace function search_posts(
  p_category text default null,
  p_keyword text default null,
  p_lng double precision default null,
  p_lat double precision default null,
  p_radius_meters double precision default 5000,
  p_hours integer default null
) returns table (
  id uuid,
  category text,
  description text,
  photo_url text,
  location_label text,
  found_at timestamptz,
  contact_info text,
  distance_meters double precision
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.category,
    p.description,
    p.photo_url,
    p.location_label,
    p.found_at,
    p.contact_info,
    case
      when p_lng is not null and p_lat is not null
        then ST_Distance(p.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography)
      else null
    end as distance_meters
  from posts p
  where p.status = 'active'
    and (p_category is null or p.category = p_category)
    and (p_keyword is null or p.description ilike '%' || p_keyword || '%')
    and (p_hours is null or p.found_at >= now() - (p_hours || ' hours')::interval)
    and (
      p_lng is null or p_lat is null
      or ST_DWithin(p.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius_meters)
    )
  order by
    distance_meters asc nulls last,
    p.found_at desc
  limit 50;
$$;

-- Back to anon + authenticated, same as 0001.
grant execute on function search_posts(text, text, double precision, double precision, double precision, integer) to anon, authenticated;

-- NOTE (still true, see README "Next up"): contact_info is returned as-is
-- by search_posts to every searcher, signed in or not. Before this goes
-- further than a class demo, put that behind a "request contact" step.
