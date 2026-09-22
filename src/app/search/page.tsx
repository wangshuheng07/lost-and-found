"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS, type Category, type PostResult } from "@/lib/schema";
import { formatDistance, timeAgo } from "@/lib/format";
import { CategoryIcon, Icon } from "@/components/Icons";
import { Field } from "@/components/Field";
import { LocationPicker } from "@/components/LocationPicker";
import { useAuth } from "@/components/AuthProvider";

const HOURS_OPTIONS = [
  { label: "Any time", value: "" },
  { label: "Last 24 hours", value: "24" },
  { label: "Last 3 days", value: "72" },
  { label: "Last 7 days", value: "168" },
];

export default function SearchPage() {
  const { user, loading: authLoading } = useAuth();

  const [category, setCategory] = useState<Category | "">("");
  const [keyword, setKeyword] = useState("");
  const [lng, setLng] = useState("");
  const [lat, setLat] = useState("");
  const [radiusMeters, setRadiusMeters] = useState("5000");
  const [hours, setHours] = useState("24");

  const [results, setResults] = useState<PostResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (lng && lat) {
      params.set("lng", lng);
      params.set("lat", lat);
      params.set("radiusMeters", radiusMeters);
    }
    if (hours) params.set("hours", hours);

    const res = await fetch(`/api/search?${params.toString()}`);
    const body = await res.json().catch(() => ({}));

    setLoading(false);

    if (!res.ok) {
      setErrorMsg(
        body?.code === "unauthorized"
          ? "Your session expired. Sign in again to keep searching."
          : (body?.error ?? "Search failed. Please try again.")
      );
      return;
    }

    setResults(body.results as PostResult[]);
  }

  if (!authLoading && !user) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-gold shadow-[3px_3px_0_0_var(--ink)]">
          <Icon name="shield" className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight">Sign in to search</h1>
        <p className="mt-2 text-muted">
          Search results include a finder&apos;s contact info, so we keep this part limited to verified
          Waterloo students.
        </p>
        <Link href="/login" className="btn btn-gold mt-6">
          Sign in with @uwaterloo.ca
          <Icon name="arrow" className="h-4 w-4" />
        </Link>
        <p className="mt-6 text-sm text-muted">
          Found something instead?{" "}
          <Link href="/found" className="underline decoration-dotted underline-offset-4">
            Anyone can post that
          </Link>
          , no account needed.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Find your item</h1>
      <p className="mt-2 max-w-xl text-muted">
        Tell us what you lost and roughly where. We&apos;ll show what people have found, closest and newest
        first.
      </p>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[22rem_1fr]">
        {/* Filters */}
        <form onSubmit={handleSearch} className="card flex flex-col gap-5 p-5 lg:sticky lg:top-24">
          <Field label="What is it?">
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              <option value="">Anything</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Keywords">
            <input
              className="input"
              placeholder="e.g. black iPhone, blue backpack"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Field>

          <Field label="Found within">
            <select className="input" value={hours} onChange={(e) => setHours(e.target.value)}>
              {HOURS_OPTIONS.map((o) => (
                <option key={o.label} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Near where you lost it</span>
            <LocationPicker
              lng={lng}
              lat={lat}
              onChange={(nextLng, nextLat) => {
                setLng(nextLng);
                setLat(nextLat);
              }}
              onError={setErrorMsg}
            />
            {lng && lat && (
              <select
                className="input mt-1"
                aria-label="Search radius"
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(e.target.value)}
              >
                <option value="500">Within 500 m</option>
                <option value="1000">Within 1 km</option>
                <option value="5000">Within 5 km</option>
                <option value="20000">Within 20 km</option>
              </select>
            )}
          </div>

          {errorMsg && (
            <p role="alert" className="rounded-xl border-2 border-ink bg-coral-soft px-3 py-2 text-sm font-medium">
              {errorMsg}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn btn-gold w-full">
            <Icon name="search" className="h-4 w-4" />
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        {/* Results */}
        <section aria-live="polite">
          {results === null && (
            <EmptyState
              title="Ready when you are"
              body="Set a few filters and hit Search. The more you tell us, the shorter the list."
            />
          )}

          {results !== null && results.length === 0 && (
            <EmptyState
              title="Nothing matches yet"
              body="Try a wider time range or a bigger radius, or search with fewer keywords. New items are posted all the time."
            />
          )}

          {results !== null && results.length > 0 && (
            <>
              <p className="mb-4 text-sm font-semibold text-muted">
                {results.length} item{results.length === 1 ? "" : "s"} found
              </p>
              <ul className="flex flex-col gap-4">
                {results.map((r) => (
                  <li key={r.id}>
                    <ResultCard post={r} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function ResultCard({ post }: { post: PostResult }) {
  return (
    <article className="card flex gap-4 p-4 sm:p-5">
      <CategoryIcon category={post.category} className="h-16 w-16" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border-2 border-ink bg-gold-soft px-2.5 py-0.5 text-xs font-bold">
            {CATEGORY_LABELS[post.category]}
          </span>
          {post.distanceMeters != null && (
            <span className="rounded-full border-2 border-ink bg-white px-2.5 py-0.5 text-xs font-bold">
              {formatDistance(post.distanceMeters)} away
            </span>
          )}
        </div>

        <h2 className="font-display text-lg font-bold leading-snug">{post.description}</h2>

        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="pin" className="h-4 w-4" />
            {post.locationLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="clock" className="h-4 w-4" />
            {timeAgo(post.foundAt)}
          </span>
        </p>

        <p className="mt-1 inline-flex w-fit max-w-full items-center gap-2 rounded-xl bg-cream px-3 py-2 text-sm font-semibold">
          <Icon name="mail" className="h-4 w-4 flex-none" />
          <span className="truncate">{post.contactInfo}</span>
        </p>
      </div>
    </article>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="card flex flex-col items-center gap-3 border-dashed px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-gold-soft">
        <Icon name="search" className="h-7 w-7" />
      </div>
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="max-w-sm text-sm text-muted">{body}</p>
    </div>
  );
}
