# Lost & Found — MVP (v2, query-based)

Two structured forms + rule-based filtering. No AI chat, no AI matching engine
— see the design diagram for the full picture of the flow.

## Stack

- **Frontend**: React + TypeScript (Next.js App Router)
- **Backend**: Next.js Route Handlers (`src/app/api/*`), TypeScript
- **Validation**: zod, shared between forms and API routes (`src/lib/schema.ts`)
- **Database**: Supabase (Postgres + PostGIS for geo queries)
- **Map**: Mapbox GL JS (not wired up yet — see "Next up")

## What's here

```
src/lib/schema.ts          shared zod schemas (the single source of truth for a "post")
src/lib/supabase.ts        lazy Supabase client (anon key only, see below)
src/lib/geolocation.ts     browser geolocation helper ("use my current location")
src/app/found/page.tsx     finder's "post what you found" form
src/app/search/page.tsx    lost person's search/filter form + results list
src/app/api/posts/route.ts    POST — create a found-item post
src/app/api/search/route.ts   GET  — filter + sort search
supabase/migrations/0001_init.sql   posts table + PostGIS + the two SQL functions
```

### Why two SQL functions instead of a plain table query

`posts` has row-level security enabled with **no policies**, so the public
anon key can't read or write it directly. All access goes through two
`security definer` SQL functions:

- `create_post(...)` — used by `/api/posts`
- `search_posts(...)` — used by `/api/search`; does the hard filter
  (category / keyword / time window / radius) and sorts by distance + time.
  Purely rule-based (`ST_DWithin` + `ORDER BY distance`) — no embeddings, no LLM.

This means raw lat/lng never leaves the database — `search_posts` only ever
returns a computed `distance_meters`, and the client can't query the table
directly to get around that.

## Setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase SQL editor, run `supabase/migrations/0001_init.sql`, then
   `supabase/migrations/0002_found_photos.sql` to enable photo uploads.
3. `cp .env.local.example .env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` /
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Project Settings → API.
4. `npm install`
5. `npm run dev` → http://localhost:3000

`/found` and `/search` both work end-to-end once the DB is set up (the
"use my current location" button needs the page served over `https://` or
`localhost` — browsers block geolocation on plain `http://`).

## Next up (in order)

1. **Photo upload** — wire the finder form's photo field to Supabase Storage,
   store the resulting URL in `photo_url`.
2. **Map view** — add Mapbox GL JS to `/search`, render `search_posts()`
   results as pins (see the design diagram for the intended look), replace
   the raw lng/lat number inputs on both forms with an actual map picker.
3. **Contact gating** — `search_posts` currently returns `contact_info` to
   every searcher. Before this goes past a class demo, put that behind a
   "request contact" step instead.
4. Deploy to Vercel (connect the GitHub repo, add the same env vars in
   Project Settings → Environment Variables).
