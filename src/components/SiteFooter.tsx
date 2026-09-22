"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteBrand } from "@/components/SiteHeader";

export function SiteFooter() {
  const pathname = usePathname();
  const branded = pathname === "/search" || pathname === "/found";

  return (
    <footer className="mt-20 border-t-2 border-ink bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="[&_span]:text-cream">
          <SiteBrand />
          <p className="mt-3 max-w-xs text-sm text-cream/70">
            A simple way to get lost things back to the people who lost them.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gold">{branded ? "Boomerang" : "Lost & Found"}</h2>
          <ul className="mt-3 space-y-2 text-sm text-cream/80">
            <li>
              <Link href="/search" className="hover:text-gold">
                Search found items
              </Link>
            </li>
            <li>
              <Link href="/found" className="hover:text-gold">
                Post something you found
              </Link>
            </li>
            <li>
              <Link href="/#how-it-works" className="hover:text-gold">
                How it works
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gold">Good to know</h2>
          <p className="mt-3 text-sm text-cream/70">
            Meet in a busy public spot to hand things over. For IDs, cards and other valuables, consider
            handing them in to campus security.
          </p>
        </div>
      </div>

      <div className="border-t border-cream/15">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-cream/60 sm:px-6">
          A student-built project. Not affiliated with or endorsed by the University of Waterloo.
        </p>
      </div>
    </footer>
  );
}
