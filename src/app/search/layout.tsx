import type { Metadata } from "next";

// Just here for the title: search/page.tsx is a Client Component, which
// can't export `metadata` itself, and this is one of the two pages (with
// /found) where the "Boomerang" brand suffix is meant to show up — see
// title.template in src/app/layout.tsx.
export const metadata: Metadata = {
  title: "Search",
};

export default function SearchLayout({ children }: LayoutProps<"/search">) {
  return children;
}
