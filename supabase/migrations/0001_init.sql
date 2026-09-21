-- Lost & Found MVP schema (v2: structured forms + rule-based query, no AI)
-- Run this in the Supabase SQL editor (or `supabase db push` if you use the CLI).

create extension if not exists postgis;

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('electronics','bag','keys','clothing','pet','document','other')),
  description text not null check (char_length(description) between 1 and 500),
  photo_url text,
  location geography(Point, 4326) not null,
  location_label text not null check (char_length(location_label) between 1 and 200),
  found_at timestamptz not null default now(),
  contact_info text not null check (char_length(contact_info) between 1 and 200),
  status text not null default 'active' check (status in ('active','resolved')),
  created_at timestamptz not null default now()
);

-- Geo queries (ST_DWithin / distance sort) need this index.
create index if not exists posts_location_gix on posts using gist (location);
create index if not exists posts_category_idx on posts (category);
create index if not exists posts_found_at_idx on posts (found_at desc);

-- Lock the table down completely: the anon/public API key gets no direct
-- table access. All reads and writes go through the two SECURITY DEFINER
-- functions below, which only expose the columns the app actually needs
-- (e.g. never the raw lat/lng, only a computed distance).
alter table posts enable row level security;

-- ---------------------------------------------------------------------
-- create_post: used by the finder's "post what you found" form
-- ---------------------------------------------------------------------
create or replace function create_post(
  p_category text,
  p_description text,
  p_photo_url text,
  p_lng double precision,
  p_lat double precision,
  p_location_label text,
  p_found_at timestamptz,
  p_contact_info text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into posts (category, description, photo_url, location, location_label, found_at, contact_info)
  values (
    p_category,
    p_description,
    p_photo_url,
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
    p_location_label,
    coalesce(p_found_at, now()),
    p_contact_info
  )
  returning id into new_id;

  return new_id;
end;
$$;

-- ---------------------------------------------------------------------
-- search_posts: used by the lost person's search/filter form.
-- Rule-based only: hard filter by category / keyword / time window /
-- radius, then sort by distance and recency. No AI, no semantic search.
-- ---------------------------------------------------------------------
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

grant execute on function create_post(text, text, text, double precision, double precision, text, timestamptz, text) to anon, authenticated;
grant execute on function search_posts(text, text, double precision, double precision, double precision, integer) to anon, authenticated;

-- NOTE (v3 / product phase): contact_info is returned as-is by search_posts
-- for now. Before this goes further than a class demo, gate it behind a
-- "request contact" step instead of exposing it to every searcher.
