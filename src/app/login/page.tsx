"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icons";
import { Field } from "@/components/Field";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Step =
  | { name: "enter-email" }
  | { name: "enter-code"; email: string }
  | { name: "sending" }
  | { name: "verifying"; email: string };

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<Step>({ name: "enter-email" });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function sendCode(targetEmail: string) {
    setStep({ name: "sending" });
    setErrorMsg(null);

    // No emailRedirectTo here on purpose: this sends a 6-digit code, not a
    // clickable link. Waterloo's Office 365 mailboxes run Microsoft Safe
    // Links, which auto-"clicks" every link in incoming mail to scan it —
    // that silently burns a one-time magic-link token before the student
    // ever opens the email. A code typed by hand has nothing for a
    // scanner to click, so it can't be consumed out from under them.
    const { error } = await getSupabaseBrowserClient().auth.signInWithOtp({ email: targetEmail });

    if (error) {
      setStep({ name: "enter-email" });
      setErrorMsg(error.message);
      return;
    }

    setStep({ name: "enter-code", email: targetEmail });
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    await sendCode(email);
  }

  async function handleCodeSubmit(e: React.FormEvent, targetEmail: string) {
    e.preventDefault();
    setStep({ name: "verifying", email: targetEmail });
    setErrorMsg(null);

    const { error } = await getSupabaseBrowserClient().auth.verifyOtp({
      email: targetEmail,
      token: code,
      type: "email",
    });

    if (error) {
      setStep({ name: "enter-code", email: targetEmail });
      setErrorMsg(error.message === "Token has expired or is invalid" ? "That code is wrong or expired. Try again, or send a new one." : error.message);
      return;
    }

    router.push("/search");
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

  if (step.name === "enter-code" || step.name === "verifying") {
    const targetEmail = step.email;
    return (
      <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-sky-soft shadow-[3px_3px_0_0_var(--ink)]">
          <Icon name="mail" className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight">Enter your code</h1>
        <p className="mt-2 text-muted">
          We sent a 6-digit code to <span className="font-semibold text-ink">{targetEmail}</span>.
          It&apos;s valid for a few minutes.
        </p>

        <form onSubmit={(e) => handleCodeSubmit(e, targetEmail)} className="card mt-8 flex flex-col gap-4 p-5 sm:p-6">
          <Field label="6-digit code">
            <input
              className="input text-center text-2xl tracking-[0.5em]"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              autoFocus
            />
          </Field>

          {errorMsg && (
            <p role="alert" className="rounded-xl border-2 border-ink bg-coral-soft px-3 py-2 text-sm font-medium">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={step.name === "verifying" || code.length !== 6}
            className="btn btn-gold w-full"
          >
            {step.name === "verifying" ? "Verifying…" : "Verify and sign in"}
          </button>

          <button
            type="button"
            onClick={() => sendCode(targetEmail)}
            className="text-sm font-medium text-muted underline decoration-dotted underline-offset-4"
          >
            Send a new code
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setStep({ name: "enter-email" });
            setCode("");
            setErrorMsg(null);
          }}
          className="mt-4 text-sm text-muted underline decoration-dotted underline-offset-4"
        >
          Use a different email
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-gold shadow-[3px_3px_0_0_var(--ink)]">
        <Icon name="shield" className="h-7 w-7" />
      </div>
      <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight">Sign in to search</h1>
      <p className="mt-2 text-muted">
        Searching shows you a finder&apos;s contact info, so we ask you to verify an email first.
        We&apos;ll send you a 6-digit code — no password.
      </p>

      <form onSubmit={handleEmailSubmit} className="card mt-8 flex flex-col gap-4 p-5 sm:p-6">
        <Field label="Email">
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
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

        <button type="submit" disabled={step.name === "sending"} className="btn btn-gold w-full">
          {step.name === "sending" ? "Sending code…" : "Email me a code"}
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
