-- Gate search_posts (which returns contact_info) behind a signed-in
-- @uwaterloo.ca session. create_post stays open to anyone — a found item
-- can be picked up by a campus visitor who has no Waterloo account, and the
-- goal is to keep that path as easy as possible.
--
-- Waterloo students sign in with a magic link sent to their uwaterloo.ca
-- inbox (Supabase Auth, email OTP — see src/app/login/page.tsx). This
-- function checks the caller's verified email itself, at the database
-- layer, rather than trusting the client: even if someone calls this RPC
-- directly with a valid session for some other email, they're rejected here.
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
  if auth.email() is null or lower(auth.email()) !~ '@uwaterloo\.ca$' then
    raise exception 'Sign in with your uwaterloo.ca email to search.'
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

-- Only authenticated (signed-in) callers can even attempt this now — the
-- function body enforces the domain check above. anon keeps create_post.
revoke execute on function search_posts(text, text, double precision, double precision, double precision, integer) from anon;
grant execute on function search_posts(text, text, double precision, double precision, double precision, integer) to authenticated;
