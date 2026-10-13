"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buyCourse, openLogin, useCourseAccess } from "@/lib/course-access";
import type { AcademyProgram } from "@/lib/types";

/**
 * The course page's main button.
 *   signed out          → Sign in to enroll (only an account can enroll)
 *   enrolled / bought   → Continue learning
 *   free course         → Enroll for free, then straight into the course
 *   paid course         → Buy course → Stripe Checkout → back into the course
 */
export default function EnrollButton({
  program,
  learnHref,
  className,
  style,
}: {
  program: AcademyProgram;
  learnHref: string;
  className: string;
  style: React.CSSProperties;
}) {
  const router = useRouter();
  const access = useCourseAccess(program);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const owned = program.isFree ? access.enrolled : access.paid;
  const price =
    program.price != null ? `${program.currency === "EUR" ? "€" : `${program.currency} `}${program.price}` : "";

  const label = !access.ready
    ? "…"
    : owned
      ? "Continue learning"
      : !access.user
        ? "Sign in to enroll"
        : program.isFree
          ? "Enroll for free"
          : `Buy course${price ? ` · ${price}` : ""}`;

  const go = async () => {
    if (owned) return router.push(learnHref);
    if (!access.user) return openLogin();
    setBusy(true);
    setError("");
    const err = program.isFree ? await access.enrollFree() : await buyCourse(program.id);
    if (err) {
      setBusy(false);
      setError(err);
      return;
    }
    if (program.isFree) router.push(learnHref);
  };

  return (
    <>
      <button type="button" onClick={go} disabled={busy || !access.ready} className={`${className} disabled:opacity-60`} style={style}>
        {busy ? "One moment…" : label}
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden>
          <path d="M1 4h10m0 0L8 1m3 3L8 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {error && <p className="mt-[8px] text-[12px] text-[#E0607E]">{error}</p>}
      {!owned && access.ready && program.lessons.some((l) => (l.access ?? (l.locked ? "members" : "public")) === "public") && (
        <a href={learnHref} className="mt-[12px] block text-center text-[12px] text-[#595C5C] underline-offset-4 hover:text-[#8B8F8F] hover:underline">
          Preview the free lessons
        </a>
      )}
    </>
  );
}
