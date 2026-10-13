"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { AcademyLesson, AcademyProgram } from "@/lib/types";

/**
 * Who may open what in one course, for the signed-in learner.
 *
 *   public  → anyone, signed in or not
 *   members → signed in AND enrolled (a free course: "Enroll for free";
 *             a paid course: buying it is the enrolment)
 *   paid    → enrolled through a purchase (or granted by an admin)
 *
 * The same rule lives in the database as academy_lesson_access(); answers and
 * comments are checked there, so this hook decides what the page shows, not
 * what the server accepts.
 */
export type Enrollment = { access_type: "free" | "paid"; status: string } | null;
export type LockReason = "sign_in" | "enroll" | "buy" | null;

export function lessonAccess(l: AcademyLesson | undefined): "public" | "members" | "paid" {
  return l?.access ?? (l?.locked ? "members" : "public");
}

export async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function openLogin() {
  window.dispatchEvent(new Event("dsh:open-login"));
}

/** Starts Stripe Checkout for a paid course. Returns an error message, or
 *  redirects and never returns. */
export async function buyCourse(programId: string): Promise<string | null> {
  const res = await fetch("/api/academy/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify({ programId }),
  });
  const body = await res.json().catch(() => ({}));
  if (res.ok && body.url) {
    window.location.href = body.url;
    return null;
  }
  return body.error || "Could not start checkout.";
}

export function useCourseAccess(program: AcademyProgram) {
  const { user, loading: authLoading } = useAuth();
  /* Tagged with the user + course it was read for, so a stale answer is never
     mistaken for the current one and "ready" needs no extra state. */
  const [state, setState] = useState<{ key: string; enrollment: Enrollment }>({ key: "", enrollment: null });
  const key = user && program.id ? `${user.id}:${program.id}` : "";

  const fetchEnrollment = useCallback(async (): Promise<Enrollment> => {
    if (!user || !program.id) return null;
    const { data } = await supabase
      .from("academy_enrollments")
      .select("access_type, status")
      .eq("program_id", program.id)
      .eq("user_id", user.id)
      .maybeSingle();
    return data && data.status === "active" ? (data as Enrollment) : null;
  }, [user, program.id]);

  const refresh = useCallback(async () => {
    const e = await fetchEnrollment();
    setState({ key, enrollment: e });
  }, [fetchEnrollment, key]);

  useEffect(() => {
    if (authLoading || !key) return;
    let live = true;
    void fetchEnrollment().then((e) => {
      if (live) setState({ key, enrollment: e });
    });
    return () => {
      live = false;
    };
  }, [authLoading, key, fetchEnrollment]);

  const enrollment: Enrollment = key && state.key === key ? state.enrollment : null;
  const loaded = !key || state.key === key;
  const enrolled = Boolean(enrollment);
  const paid = enrollment?.access_type === "paid";

  /** Why this lesson is closed to the learner, or null when it is open. */
  const lockOf = (l: AcademyLesson | undefined): LockReason => {
    const a = lessonAccess(l);
    if (a === "public") return null;
    if (!user) return "sign_in";
    if (a === "members") return enrolled ? null : program.isFree ? "enroll" : "buy";
    return paid ? null : "buy";
  };

  const enrollFree = async (): Promise<string | null> => {
    if (!user) {
      openLogin();
      return null;
    }
    const { error } = await supabase.rpc("academy_enroll_learner", { p_program_id: program.id });
    if (error) return "Could not enroll. Please try again.";
    await refresh();
    return null;
  };

  return {
    user,
    ready: !authLoading && loaded,
    enrollment,
    enrolled,
    paid,
    lockOf,
    enrollFree,
    refresh,
  };
}
