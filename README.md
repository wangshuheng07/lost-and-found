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
src/lib/supabase.ts        lazy Supabase client (anon key only, no user session — used by /api/posts)
src/lib/supabase-browser.ts   browser Supabase client (session in cookies, used by login/AuthProvider)
src/lib/supabase-server.ts    server Supabase client (reads the session cookie, used by /api/search)
src/lib/geolocation.ts     browser geolocation helper ("use my current location")
src/middleware.ts          refreshes the auth session cookie on every request
src/components/AuthProvider.tsx   client-side auth context (current user, sign out)
src/app/login/page.tsx     Waterloo-only sign-in (email magic link)
src/app/auth/callback/route.ts    exchanges the magic-link code for a session
src/app/found/page.tsx     finder's "post what you found" form — no account needed
src/app/search/page.tsx    lost person's search/filter form + results list — sign-in required
src/app/api/posts/route.ts    POST — create a found-item post
src/app/api/search/route.ts   GET  — filter + sort search (session-aware, see auth below)
supabase/migrations/0001_init.sql   posts table + PostGIS + the two SQL functions
supabase/migrations/0002_found_photos.sql   found-photos Storage bucket + upload policy
supabase/migrations/0003_require_waterloo_auth_for_search.sql   gates search_posts to @uwaterloo.ca
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

### Who needs to sign in

Anyone can post a found item at `/found` — no account needed, since whoever
picks something up on campus (student, staff, visitor) should be able to
report it with no friction. `/search` returns `contact_info`, though, so
*that* side is gated to signed-in `@uwaterloo.ca` students:

- Sign-in is a Supabase Auth email magic link (`/login` → `signInWithOtp`),
  not a password. `middleware.ts` + `src/lib/supabase-server.ts` keep the
  session in a cookie shared between the browser and Route Handlers.
- The domain check itself lives in the database, not just the client:
  `search_posts()` (in `0003_require_waterloo_auth_for_search.sql`) reads the
  caller's verified email via `auth.email()` and raises an error for anything
  that isn't `@uwaterloo.ca`, so calling the RPC directly with some other
  session doesn't get around it. `/api/search` just relays that error as a
  401.

## Setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase SQL editor, run, in order:
   `supabase/migrations/0001_init.sql`,
   `supabase/migrations/0002_found_photos.sql` (photo uploads), then
   `supabase/migrations/0003_require_waterloo_auth_for_search.sql`
   (gates search to `@uwaterloo.ca`).
3. In Authentication → URL Configuration, add
   `http://localhost:3000/auth/callback` (and your deployed URL's
   `/auth/callback`) to **Redirect URLs**. Email auth is on by default, so no
   other Auth settings need to change.
4. `cp .env.local.example .env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` /
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Project Settings → API.
5. `npm install`
6. `npm run dev` → http://localhost:3000

`/found` works immediately. `/search` needs step 3 done and a real
`@uwaterloo.ca` inbox to click the sign-in link from (the "use my current
location" button, on both pages, needs `https://` or `localhost` — browsers
block geolocation on plain `http://`).

## Next up (in order)

1. **Map view** — add Mapbox GL JS to `/search`, render `search_posts()`
   results as pins (see the design diagram for the intended look), replace
   the raw lng/lat number inputs on both forms with an actual map picker.
2. **Contact gating v2** — search is now sign-in gated, but `search_posts`
   still hands every matching result's `contact_info` straight to the
   searcher. A "request contact" step (notify the finder, they approve
   before it's shown) would be a further step before this is more than a
   class demo.
3. Deploy to Vercel (connect the GitHub repo, add the same env vars in
   Project Settings → Environment Variables, and add the Vercel URL's
   `/auth/callback` to Supabase's Redirect URLs).
