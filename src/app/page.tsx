import Link from "next/link";
import { CategoryIcon, Icon, type IconName } from "@/components/Icons";
import type { Category } from "@/lib/schema";

const HERO_TILES: { category: Category; rotate: string }[] = [
  { category: "electronics", rotate: "-rotate-6" },
  { category: "keys", rotate: "rotate-3" },
  { category: "bag", rotate: "rotate-6" },
  { category: "document", rotate: "rotate-2" },
  { category: "clothing", rotate: "-rotate-3" },
  { category: "pet", rotate: "-rotate-6" },
];

const STEPS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "camera",
    title: "Found something? Post it",
    body: "Pick a category, describe it, and drop a pin where you found it. It takes about a minute.",
  },
  {
    icon: "search",
    title: "Owners search",
    body: "Anyone who lost something filters by category, keyword, place and time to spot it fast.",
  },
  {
    icon: "back",
    title: "It goes home",
    body: "The owner gets in touch, you meet somewhere public, and the thing finds its way back.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[1.2fr_1fr] md:pt-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-coral" />
            Campus lost &amp; found
          </p>
          <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">
            Lost it on campus? Let&apos;s get it <span className="marker">back</span>.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted">
            Somebody probably picked it up. Search what&apos;s been found nearby, or post what you found so
            the owner can find you.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/search" className="btn btn-gold">
              <Icon name="search" className="h-4 w-4" />
              I lost something
            </Link>
            <Link href="/found" className="btn btn-white">
              I found something
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div aria-hidden="true" className="hidden grid-cols-3 gap-4 md:grid">
          {HERO_TILES.map(({ category, rotate }) => (
            <div
              key={category}
              className={`${rotate} flex aspect-square items-center justify-center rounded-3xl border-2 border-ink bg-white shadow-[4px_4px_0_0_var(--ink)]`}
            >
              <CategoryIcon category={category} className="h-20 w-20" iconClassName="h-10 w-10" />
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-y-2 border-ink bg-gold">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-2 max-w-md text-ink/75">Three steps, no account needed.</p>

          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="card relative p-6 shadow-[4px_4px_0_0_var(--ink)]">
                <span className="absolute -top-4 left-5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-cream font-display text-sm font-extrabold">
                  {i + 1}
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-cream">
                  <Icon name={step.icon} />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What you can filter by */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Narrow it down in seconds
            </h2>
            <p className="mt-3 max-w-md text-muted">
              Filter found items by what it is, when it turned up, and how close it was to where you lost
              it. Closest and newest come first.
            </p>
            <Link href="/search" className="btn btn-gold mt-6">
              Start searching
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(
              [
                ["electronics", "Electronics"],
                ["bag", "Bags"],
                ["keys", "Keys"],
                ["clothing", "Clothing"],
                ["pet", "Pets"],
                ["document", "IDs & documents"],
              ] as [Category, string][]
            ).map(([category, label]) => (
              <li key={category} className="card flex items-center gap-3 p-3">
                <CategoryIcon category={category} className="h-11 w-11" iconClassName="h-5 w-5" />
                <span className="text-sm font-semibold leading-tight">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Safety */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="card flex flex-col gap-4 bg-mint-soft p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl border-2 border-ink bg-white">
            <Icon name="shield" className="h-7 w-7" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Hand-offs, the safe way</h2>
            <p className="mt-1 max-w-2xl text-sm text-ink/75">
              Meet somewhere busy and public, like the DC or the SLC, and ask the owner to describe the item
              before you show it. For IDs and other valuables, consider handing them in to campus security.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
