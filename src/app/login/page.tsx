"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icons";
import { Field } from "@/components/Field";
import { useAuth, isWaterlooEmail } from "@/components/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Status = "idle" | "sending" | "sent" | "error";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isWaterlooEmail(email)) {
      setStatus("error");
      setErrorMsg("Use your @uwaterloo.ca email — search is limited to Waterloo students.");
      return;
    }

    setStatus("sending");
    setErrorMsg(null);

    const { error } = await getSupabaseBrowserClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/search` },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setStatus("sent");
  }

  if (user) {
    return (
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center sm:px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-ink bg-mint shadow-[4px_4px_0_0_var(--ink)]">
          <Icon name="check" className="h-10 w-10" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">You&apos;re signed in</h1>
        <p className="mt-2 text-muted">{user.email}</p>
        <button type="button" onClick={() => router.push("/search")} className="btn btn-gold mt-8">
          Go to search
          <Icon name="arrow" className="h-4 w-4" />
        </button>
      </main>
    );
  }

  if (status === "sent") {
    return (
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center sm:px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-ink bg-sky-soft shadow-[4px_4px_0_0_var(--ink)]">
          <Icon name="mail" className="h-10 w-10" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">Check your inbox</h1>
        <p className="mt-2 max-w-sm text-muted">
          We sent a sign-in link to <span className="font-semibold text-ink">{email}</span>. Open it on
          this device to finish signing in.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-gold shadow-[3px_3px_0_0_var(--ink)]">
        <Icon name="shield" className="h-7 w-7" />
      </div>
      <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight">Waterloo students only</h1>
      <p className="mt-2 text-muted">
        Searching shows you a finder&apos;s contact info, so we keep it limited to verified Waterloo
        students. We&apos;ll email you a one-click sign-in link — no password.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 flex flex-col gap-4 p-5 sm:p-6">
        <Field label="Waterloo email">
          <input
            className="input"
            type="email"
            placeholder="you@uwaterloo.ca"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        {errorMsg && (
          <p role="alert" className="rounded-xl border-2 border-ink bg-coral-soft px-3 py-2 text-sm font-medium">
            {errorMsg}
          </p>
        )}

        <button type="submit" disabled={status === "sending"} className="btn btn-gold w-full">
          {status === "sending" ? "Sending link…" : "Email me a sign-in link"}
        </button>
      </form>

      <p className="mt-4 text-xs text-muted">
        Found something instead? You don&apos;t need an account —{" "}
        <a href="/found" className="underline decoration-dotted underline-offset-4">
          post it here
        </a>
        .
      </p>
    </main>
  );
}
