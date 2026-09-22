import type { Metadata } from "next";

// Just here for the title: found/page.tsx is a Client Component, which
// can't export `metadata` itself, and this is one of the two pages (with
// /search) where the "Boomerang" brand suffix is meant to show up — see
// title.template in src/app/layout.tsx.
export const metadata: Metadata = {
  title: "Post a find",
};

export default function FoundLayout({ children }: LayoutProps<"/found">) {
  return children;
}
