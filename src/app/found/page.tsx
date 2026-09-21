"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/schema";
import { getCurrentPosition } from "@/lib/geolocation";

type Status = "idle" | "submitting" | "success" | "error";

export default function FoundItemPage() {
  const [category, setCategory] = useState<Category>("electronics");
  const [description, setDescription] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [lng, setLng] = useState("");
  const [lat, setLat] = useState("");
  const [foundAt, setFoundAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [contactInfo, setContactInfo] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleUseMyLocation() {
    try {
      const pos = await getCurrentPosition();
      setLng(pos.lng.toFixed(6));
      setLat(pos.lat.toFixed(6));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "获取定位失败，请手动填写经纬度");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        description,
        photoUrl: null, // TODO: wire up Supabase Storage upload
        lng: Number(lng),
        lat: Number(lat),
        locationLabel,
        foundAt: new Date(foundAt).toISOString(),
        contactInfo,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setStatus("error");
      setErrorMsg(body?.error ?? "提交失败，请重试");
      return;
    }

    setStatus("success");
  }

  if (status === "success") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-4xl">✅</div>
        <h1 className="text-xl font-semibold">帖子已发布</h1>
        <p className="text-sm text-zinc-500">感谢你把捡到的东西发布出来，失主可能很快就能通过搜索找到它。</p>
        <Link
          href="/"
          className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
        >
          返回首页
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← 返回首页
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">拾获者 · 发帖</h1>
      <p className="mt-1 text-sm text-zinc-500">告诉我们你捡到了什么，失主搜索时才能找到这条帖子。</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <Field label="类别">
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="物品描述">
          <textarea
            className="input min-h-[88px] resize-y"
            placeholder="例如：黑色手机，深蓝色保护壳，背面有一道划痕"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            maxLength={500}
          />
        </Field>

        <Field label="照片">
          <div className="input flex items-center justify-between text-zinc-400">
            <span>📷 图片上传（下一步接入）</span>
          </div>
        </Field>

        <Field label="拾获地点描述">
          <input
            className="input"
            placeholder="例如：DC 图书馆 2 楼自习区"
            value={locationLabel}
            onChange={(e) => setLocationLabel(e.target.value)}
            required
            maxLength={200}
          />
        </Field>

        <Field label="拾获地点坐标">
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="经度 lng"
              inputMode="decimal"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              required
            />
            <input
              className="input"
              placeholder="纬度 lat"
              inputMode="decimal"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
            />
          </div>
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="mt-1 w-fit text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            📍 使用我当前的位置
          </button>
          <p className="text-xs text-zinc-400">地图取点会在后续接入 Mapbox 后替换这两个输入框。</p>
        </Field>

        <Field label="拾获时间">
          <input
            className="input"
            type="date"
            value={foundAt}
            onChange={(e) => setFoundAt(e.target.value)}
            required
          />
        </Field>

        <Field label="联系方式">
          <input
            className="input"
            placeholder="微信 / 邮箱 / 电话"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            required
            maxLength={200}
          />
        </Field>

        {errorMsg && <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {status === "submitting" ? "提交中…" : "发布"}
        </button>
      </form>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-zinc-500">{label}</span>
      {children}
    </label>
  );
}
