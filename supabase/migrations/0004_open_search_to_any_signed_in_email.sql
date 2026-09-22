-- Drop the @uwaterloo.ca domain restriction on search_posts. Search still
-- requires a signed-in, email-verified session (sign-in code via Supabase
-- Auth, see src/app/login/page.tsx) — that's still worth keeping, since
-- search_posts returns contact_info and an anonymous/unverified caller
-- shouldn't get that for free — but any email can now complete it, not
-- just uwaterloo.ca. create_post is unaffected (already open to anyone).
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
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.email() is null then
    raise exception 'Sign in to search.'
      using errcode = '42501'; -- insufficient_privilege
  end if;

  return query
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
end;
$$;

-- Unchanged from 0003: still authenticated-only, just no domain check
-- inside the function body anymore.
revoke execute on function search_posts(text, text, double precision, double precision, double precision, integer) from anon;
grant execute on function search_posts(text, text, double precision, double precision, double precision, integer) to authenticated;
