"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS, type Category, type PostResult } from "@/lib/schema";
import { getCurrentPosition } from "@/lib/geolocation";

const HOURS_OPTIONS = [
  { label: "Any time", value: "" },
  { label: "Last 24 hours", value: "24" },
  { label: "Last 3 days", value: "72" },
  { label: "Last 7 days", value: "168" },
];

export default function SearchPage() {
  const [category, setCategory] = useState<Category | "">("");
  const [keyword, setKeyword] = useState("");
  const [lng, setLng] = useState("");
  const [lat, setLat] = useState("");
  const [radiusMeters, setRadiusMeters] = useState("5000");
  const [hours, setHours] = useState("24");

  const [results, setResults] = useState<PostResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleUseMyLocation() {
    try {
      const pos = await getCurrentPosition();
      setLng(pos.lng.toFixed(6));
      setLat(pos.lat.toFixed(6));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to get location. Please enter longitude/latitude manually.");
    }
  }

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
      setErrorMsg(body?.error ?? "Search failed. Please try again.");
      return;
    }

    setResults(body.results as PostResult[]);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← Back to home
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">Lost something · Search</h1>
      <p className="mt-1 text-sm text-zinc-500">Filter by category, keyword, location, and time to see if anyone has found what you lost.</p>

      <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Time range">
            <select className="input" value={hours} onChange={(e) => setHours(e.target.value)}>
              {HOURS_OPTIONS.map((o) => (
                <option key={o.label} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Keywords">
          <input
            className="input"
            placeholder="e.g. black iPhone, blue backpack"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </Field>

        <Field label="Search center (optional; leave blank to skip distance filtering)">
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="Longitude (lng)"
              inputMode="decimal"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
            />
            <input
              className="input"
              placeholder="Latitude (lat)"
              inputMode="decimal"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
            <select className="input max-w-[9rem]" value={radiusMeters} onChange={(e) => setRadiusMeters(e.target.value)}>
              <option value="500">Within 500m</option>
              <option value="1000">Within 1km</option>
              <option value="5000">Within 5km</option>
              <option value="20000">Within 20km</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="mt-1 w-fit text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            📍 Use my current location
          </button>
        </Field>

        {errorMsg && <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      <section className="mt-8">
        {results === null && (
          <p className="text-sm text-zinc-400">Set your filters and click “Search” to see results.</p>
        )}
        {results !== null && results.length === 0 && (
          <p className="text-sm text-zinc-400">No found-item posts match. Try different filters.</p>
        )}
        <ul className="flex flex-col gap-3">
          {results?.map((r) => (
            <li key={r.id} className="flex gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex h-16 w-16 flex-none items-center justify-center rounded-lg bg-orange-50 text-2xl dark:bg-orange-950">
                📦
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="w-fit rounded-full bg-orange-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                  {CATEGORY_LABELS[r.category]}
                </span>
                <p className="truncate font-medium">{r.description}</p>
                <p className="text-xs text-zinc-500">
                  Found at {r.locationLabel} · {new Date(r.foundAt).toLocaleString()}
                  {r.distanceMeters != null && ` · ${Math.round(r.distanceMeters)}m away`}
                </p>
                <p className="text-xs text-zinc-500">Contact: {r.contactInfo}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-xs text-zinc-400">A map view (Snapchat-style pins) will be added to this page once Mapbox is integrated.</p>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-zinc-500">{label}</span>
      {children}
    </label>
  );
}
