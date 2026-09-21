import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-wide text-zinc-400">Lost &amp; Found · MVP</p>
      <h1 className="mt-3 text-3xl font-semibold">Did you lose something, or find something?</h1>
      <p className="mt-2 max-w-md text-sm text-zinc-500">
        Two structured forms and one filtered search — no AI Q&A, no AI matching engine.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/search"
          className="rounded-2xl border border-zinc-200 p-6 transition hover:border-blue-400 hover:bg-blue-50/50 dark:border-zinc-800 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
        >
          <div className="text-2xl">🔍</div>
          <h2 className="mt-3 text-lg font-semibold">I lost something</h2>
          <p className="mt-1 text-sm text-zinc-500">Search found-item posts by category, keyword, location, and time</p>
        </Link>

        <Link
          href="/found"
          className="rounded-2xl border border-zinc-200 p-6 transition hover:border-orange-400 hover:bg-orange-50/50 dark:border-zinc-800 dark:hover:border-orange-500 dark:hover:bg-orange-950/30"
        >
          <div className="text-2xl">📦</div>
          <h2 className="mt-3 text-lg font-semibold">I found something</h2>
          <p className="mt-1 text-sm text-zinc-500">Post a found item to help the owner get it back sooner</p>
        </Link>
      </div>
    </main>
  );
}
