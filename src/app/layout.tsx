import type { Metadata } from "next";
import "./globals.css";

// Not using next/font/google here on purpose: it fetches fonts.googleapis.com
// at build time, which fails in network-restricted environments (CI, some
// sandboxes). System font stack is plenty for an MVP — swap in a real
// typeface later if the visual design calls for one.

export const metadata: Metadata = {
  title: "Lost & Found",
  description: "结构化表单 + 规则化筛选查询的失物招领 MVP（无 AI 问答/匹配）",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
