import type { Metadata } from "next";
import "./globals.css";

// Not using next/font/google here on purpose: it fetches fonts.googleapis.com
// at build time, which fails in network-restricted environments (CI, some
// sandboxes). System font stack is plenty for an MVP — swap in a real
// typeface later if the visual design calls for one.

export const metadata: Metadata = {
  title: "Lost & Found",
  description: "Lost & found MVP: structured forms + rule-based filtered search (no AI Q&A/matching)",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
