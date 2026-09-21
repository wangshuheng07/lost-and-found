import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-wide text-zinc-400">Lost &amp; Found · MVP</p>
      <h1 className="mt-3 text-3xl font-semibold">你是丢了东西，还是捡到了东西？</h1>
      <p className="mt-2 max-w-md text-sm text-zinc-500">
        两个结构化表单，一次筛选查询——没有 AI 问答，也没有 AI 匹配引擎。
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/search"
          className="rounded-2xl border border-zinc-200 p-6 transition hover:border-blue-400 hover:bg-blue-50/50 dark:border-zinc-800 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
        >
          <div className="text-2xl">🔍</div>
          <h2 className="mt-3 text-lg font-semibold">我丢了东西</h2>
          <p className="mt-1 text-sm text-zinc-500">按类别、关键词、地点和时间搜索拾获帖子</p>
        </Link>

        <Link
          href="/found"
          className="rounded-2xl border border-zinc-200 p-6 transition hover:border-orange-400 hover:bg-orange-50/50 dark:border-zinc-800 dark:hover:border-orange-500 dark:hover:bg-orange-950/30"
        >
          <div className="text-2xl">📦</div>
          <h2 className="mt-3 text-lg font-semibold">我捡到了东西</h2>
          <p className="mt-1 text-sm text-zinc-500">发布拾获帖子，帮失主更快找回</p>
        </Link>
      </div>
    </main>
  );
}
