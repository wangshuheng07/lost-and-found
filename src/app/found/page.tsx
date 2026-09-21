"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/schema";
import { getCurrentPosition } from "@/lib/geolocation";

type Status = "idle" | "submitting" | "success" | "error";

export default function FoundItemPage() {
  const [category, setCategory] = useState<Category>("electronics");
  const [description, setDescription] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [lng, setLng] = useState("");
  const [lat, setLat] = useState("");
  const [foundAt, setFoundAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [contactInfo, setContactInfo] = useState("");
  const [status, setStatus] = useState<Status>("idle");
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        description,
        photoUrl: null, // TODO: wire up Supabase Storage upload
        lng: Number(lng),
        lat: Number(lat),
        locationLabel,
        foundAt: new Date(foundAt).toISOString(),
        contactInfo,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setStatus("error");
      setErrorMsg(body?.error ?? "Submission failed. Please try again.");
      return;
    }

    setStatus("success");
  }

  if (status === "success") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-4xl">✅</div>
        <h1 className="text-xl font-semibold">Post published</h1>
        <p className="text-sm text-zinc-500">Thanks for posting what you found. The owner may be able to find it through search soon.</p>
        <Link
          href="/"
          className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
        >
          Back to home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← Back to home
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">Found something · Post</h1>
      <p className="mt-1 text-sm text-zinc-500">Tell us what you found so the owner can find this post when searching.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <Field label="Category">
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Item description">
          <textarea
            className="input min-h-[88px] resize-y"
            placeholder="e.g. black phone, dark blue case, a scratch on the back"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            maxLength={500}
          />
        </Field>

        <Field label="Photo">
          <div className="input flex items-center justify-between text-zinc-400">
            <span>📷 Image upload (coming next)</span>
          </div>
        </Field>

        <Field label="Found location description">
          <input
            className="input"
            placeholder="e.g. DC Library, 2nd floor study area"
            value={locationLabel}
            onChange={(e) => setLocationLabel(e.target.value)}
            required
            maxLength={200}
          />
        </Field>

        <Field label="Found location coordinates">
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="Longitude (lng)"
              inputMode="decimal"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              required
            />
            <input
              className="input"
              placeholder="Latitude (lat)"
              inputMode="decimal"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
            />
          </div>
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="mt-1 w-fit text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            📍 Use my current location
          </button>
          <p className="text-xs text-zinc-400">Map-based picking will replace these two inputs once Mapbox is integrated.</p>
        </Field>

        <Field label="Found time">
          <input
            className="input"
            type="date"
            value={foundAt}
            onChange={(e) => setFoundAt(e.target.value)}
            required
          />
        </Field>

        <Field label="Contact info">
          <input
            className="input"
            placeholder="WeChat / email / phone"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            required
            maxLength={200}
          />
        </Field>

        {errorMsg && <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {status === "submitting" ? "Submitting…" : "Post"}
        </button>
      </form>
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
