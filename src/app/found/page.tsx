"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/schema";
import { getSupabaseClient } from "@/lib/supabase";
import { Icon } from "@/components/Icons";
import { Field } from "@/components/Field";
import { LocationPicker } from "@/components/LocationPicker";

type Status = "idle" | "submitting" | "success" | "error";

// Written out in full so Tailwind can find every class at build time.
const CHECKED_TILE: Record<Category, string> = {
  electronics: "peer-checked:bg-sky-soft",
  bag: "peer-checked:bg-coral-soft",
  keys: "peer-checked:bg-gold-soft",
  clothing: "peer-checked:bg-lilac-soft",
  pet: "peer-checked:bg-mint-soft",
  document: "peer-checked:bg-sky-soft",
  other: "peer-checked:bg-gold-soft",
};

export default function FoundItemPage() {
  const [category, setCategory] = useState<Category>("electronics");
  const [photo, setPhoto] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [lng, setLng] = useState("");
  const [lat, setLat] = useState("");
  const [foundAt, setFoundAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [contactInfo, setContactInfo] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!lng || !lat) {
      setStatus("error");
      setErrorMsg("Please set where you found it, using your current location or coordinates.");
      return;
    }

    setStatus("submitting");
    setErrorMsg(null);

    try {
      let photoUrl: string | null = null;
      if (photo) {
        const extensions: Record<string, string> = {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
        };
        const extension = extensions[photo.type];
        if (!extension || photo.size > 5 * 1024 * 1024) {
          throw new Error("Choose a JPEG, PNG, or WebP photo no larger than 5 MB.");
        }

        const storage = getSupabaseClient().storage.from("found-photos");
        const { data, error } = await storage.upload(
          `${crypto.randomUUID()}.${extension}`,
          photo,
          { contentType: photo.type, upsert: false }
        );
        if (error) throw new Error(`Photo upload failed: ${error.message}`);
        photoUrl = storage.getPublicUrl(data.path).data.publicUrl;
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description,
          photoUrl,
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
    } catch (error) {
      setStatus("error");
      setErrorMsg(error instanceof Error ? error.message : "Submission failed. Please try again.");
    }
  }

  function postAnother() {
    setPhoto(null);
    setDescription("");
    setLocationLabel("");
    setStatus("idle");
  }

  if (status === "success") {
    return (
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center sm:px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-ink bg-mint shadow-[4px_4px_0_0_var(--ink)]">
          <Icon name="check" className="h-10 w-10" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">You&apos;re a legend</h1>
        <p className="mt-2 text-muted">
          Your post is live. If the owner searches for it, they&apos;ll find it and reach out to you.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={postAnother} className="btn btn-gold">
            Post another
          </button>
          <Link href="/" className="btn btn-white">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Post what you found</h1>
      <p className="mt-2 text-muted">
        Give the owner enough to recognise it, but keep one detail back so you can check it&apos;s really
        theirs.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        {/* 1 */}
        <fieldset className="card flex flex-col gap-5 p-5 sm:p-6">
          <Legend n={1} title="What did you find?" />

          <div>
            <span className="text-sm font-semibold">Category</span>
            <div role="radiogroup" aria-label="Category" className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CATEGORIES.map((c) => (
                <label key={c} className="cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={c}
                    checked={category === c}
                    onChange={() => setCategory(c)}
                    className="peer sr-only"
                  />
                  <span
                    className={`flex items-center gap-2 rounded-xl border-2 border-ink bg-white px-3 py-2.5 text-sm font-semibold transition peer-checked:shadow-[3px_3px_0_0_var(--ink)] peer-focus-visible:outline-[3px] peer-focus-visible:outline-sky ${CHECKED_TILE[c]}`}
                  >
                    <Icon name={c} className="h-4 w-4 flex-none" />
                    {CATEGORY_LABELS[c]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Field label="Description">
            <textarea
              className="input min-h-24 resize-y"
              placeholder="e.g. Black phone with a dark blue case"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={500}
            />
          </Field>

          <Field label="Photo (optional)" hint="JPEG, PNG, or WebP, up to 5 MB.">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="input"
              disabled={status === "submitting"}
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            />
          </Field>
        </fieldset>

        {/* 2 */}
        <fieldset className="card flex flex-col gap-5 p-5 sm:p-6">
          <Legend n={2} title="Where and when?" />

          <Field label="Where was it?" hint="A place name people will recognise.">
            <input
              className="input"
              placeholder="e.g. DC Library, 2nd floor study area"
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              required
              maxLength={200}
            />
          </Field>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Pin the spot</span>
            <LocationPicker
              lng={lng}
              lat={lat}
              onChange={(nextLng, nextLat) => {
                setLng(nextLng);
                setLat(nextLat);
              }}
              onError={setErrorMsg}
            />
          </div>

          <Field label="Date found">
            <input
              className="input"
              type="date"
              value={foundAt}
              onChange={(e) => setFoundAt(e.target.value)}
              required
            />
          </Field>
        </fieldset>

        {/* 3 */}
        <fieldset className="card flex flex-col gap-5 p-5 sm:p-6">
          <Legend n={3} title="How can the owner reach you?" />

          <Field label="Contact" hint="Shown to anyone who finds your post. A school email works well.">
            <input
              className="input"
              placeholder="Email, phone or WeChat"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              required
              maxLength={200}
            />
          </Field>
        </fieldset>

        {errorMsg && (
          <p role="alert" className="rounded-xl border-2 border-ink bg-coral-soft px-4 py-3 text-sm font-medium">
            {errorMsg}
          </p>
        )}

        <button type="submit" disabled={status === "submitting"} className="btn btn-gold w-full py-3 text-base">
          {status === "submitting" ? "Posting…" : "Post it"}
        </button>
      </form>
    </main>
  );
}

function Legend({ n, title }: { n: number; title: string }) {
  return (
    <legend className="mb-1 flex items-center gap-3 px-0 font-display text-xl font-bold">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-gold text-sm font-extrabold">
        {n}
      </span>
      {title}
    </legend>
  );
}
