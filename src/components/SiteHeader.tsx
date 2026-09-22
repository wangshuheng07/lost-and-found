"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icons";

// The "Boomerang" brand only shows up once someone's inside the app
// (searching or posting) — the homepage nav stays a plain, neutral
// "Lost & Found" so the landing page doesn't lead with a made-up brand name.
const BRANDED_PATHS = ["/search", "/found"];

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink bg-gold shadow-[2px_2px_0_0_var(--ink)]">
        <Icon name="back" className="h-5 w-5" />
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight">Boomerang</span>
    </span>
  );
}

export function SiteBrand() {
  const pathname = usePathname();
  return BRANDED_PATHS.includes(pathname) ? (
    <Logo />
  ) : (
    <span className="font-display text-xl font-extrabold tracking-tight">Lost &amp; Found</span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b-2 border-ink bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Home">
          <SiteBrand />
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4" aria-label="Main">
          <Link
            href="/search"
            aria-current={pathname === "/search" ? "page" : undefined}
            className={`rounded-full px-3 py-2 text-sm font-semibold hover:bg-gold-soft ${
              pathname === "/search" ? "bg-gold-soft" : ""
            }`}
          >
            Search
          </Link>
          <Link href="/found" className="btn btn-gold btn-sm">
            Post a find
          </Link>
        </nav>
      </div>
    </header>
  );
}
