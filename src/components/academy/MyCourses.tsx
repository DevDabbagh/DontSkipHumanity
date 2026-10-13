"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { cdnImage } from "@/lib/image-url";
import { useLocaleHref } from "@/contexts/LocaleContext";

/**
 * Profile → My courses. Every course the learner is enrolled in, how far
 * they are (the same lessons the certificate counts), a way back in, and the
 * certificate once earned.
 */
type Row = {
  id: string;
  slug: string;
  title: string;
  thumb: string;
  accessType: "free" | "paid";
  total: number;
  done: number;
  certificate: string | null;
};

const COUNTED = ["video", "survey", "quiz", "page", "file"];

function text(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    const m = v as Record<string, string>;
    return m.en?.trim() || m.pt?.trim() || Object.values(m).find((s) => s?.trim()) || "";
  }
  return "";
}

export default function MyCourses({ userId }: { userId: string }) {
  const href = useLocaleHref();
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    let live = true;
    void (async () => {
      const { data: enr } = await supabase
        .from("academy_enrollments")
        .select("program_id, access_type, created_at, academy_programs(id, slug, title, thumbnail_url, cover_url)")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      const ids = (enr ?? []).map((e) => e.program_id as string);
      if (ids.length === 0) {
        if (live) setRows([]);
        return;
      }
      const [{ data: lessons }, { data: progress }, { data: certs }] = await Promise.all([
        supabase.from("academy_lessons").select("id, program_id, type, question_set_id").in("program_id", ids),
        supabase.from("academy_lesson_progress").select("lesson_id, program_id").in("program_id", ids).not("completed_at", "is", null),
        supabase.from("academy_certificates").select("program_id, code").in("program_id", ids),
      ]);
      const counted = new Map<string, Set<string>>();
      (lessons ?? []).forEach((l) => {
        if (!COUNTED.includes(l.type as string)) return;
        if ((l.type === "survey" || l.type === "quiz") && !l.question_set_id) return;
        const set = counted.get(l.program_id as string) ?? new Set<string>();
        set.add(l.id as string);
        counted.set(l.program_id as string, set);
      });
      const out: Row[] = (enr ?? []).flatMap((e) => {
        const p = (Array.isArray(e.academy_programs) ? e.academy_programs[0] : e.academy_programs) as
          | { id: string; slug: string; title: unknown; thumbnail_url?: string; cover_url?: string }
          | null;
        if (!p) return [];
        const set = counted.get(p.id) ?? new Set<string>();
        const done = (progress ?? []).filter((r) => r.program_id === p.id && set.has(r.lesson_id as string)).length;
        return [
          {
            id: p.id,
            slug: p.slug,
            title: text(p.title),
            thumb: cdnImage(p.thumbnail_url) || cdnImage(p.cover_url) || "",
            accessType: e.access_type as "free" | "paid",
            total: set.size,
            done,
            certificate: (certs ?? []).find((c) => c.program_id === p.id)?.code ?? null,
          },
        ];
      });
      if (live) setRows(out);
    })();
    return () => {
      live = false;
    };
  }, [userId]);

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 mb-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">My courses</h2>
        <Link href={href("/academy")} className="text-xs text-[#32C6CC] hover:underline">
          Browse the Academy →
        </Link>
      </div>

      {rows === null ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500">You haven&apos;t enrolled in a course yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((r) => {
            const pct = r.total ? Math.round((r.done / r.total) * 100) : 0;
            return (
              <li key={r.id} className="flex gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <Link href={href(`/course/${r.slug}`)} className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {r.thumb ? <img src={r.thumb} alt="" className="h-[68px] w-[110px] rounded-lg object-cover" /> : <span className="block h-[68px] w-[110px] rounded-lg bg-white/5" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={href(`/course/${r.slug}`)} className="truncate text-sm font-medium text-white hover:underline">
                      {r.title}
                    </Link>
                    <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-400">
                      {r.accessType === "paid" ? "Purchased" : "Free"}
                    </span>
                  </div>
                  <div className="mt-2 h-[5px] w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(to right, #32C6CC, #B23495)" }} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-gray-500">
                      {pct}% · {r.done} of {r.total} lessons
                    </span>
                    <span className="flex items-center gap-3">
                      {r.certificate && (
                        <Link href={href(`/certificate/${r.certificate}`)} className="text-[#32C6CC] hover:underline">
                          View certificate
                        </Link>
                      )}
                      <Link href={href(`/course/${r.slug}/learn`)} className="text-white hover:underline">
                        {pct === 0 ? "Start" : pct === 100 ? "Review" : "Continue"} →
                      </Link>
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
