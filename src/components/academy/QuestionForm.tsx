"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { openLogin } from "@/lib/course-access";
import type { AcademyLesson, AcademyQuestion } from "@/lib/types";

/**
 * A survey or quiz lesson.
 *
 * Answers are sent to academy_submit_answers(), which saves them and — for a
 * quiz — grades them against the answer key on the server (the browser never
 * sees it) and only marks the lesson complete at the pass mark. A survey is
 * complete as soon as it is sent.
 */
type Value = string | string[];
type Result = { kind: string; score: number | null; pass_mark: number; passed: boolean; results: { question_id: string; correct: boolean }[] };

const BODY_14 = "font-[family-name:var(--font-source-sans)] text-[14px] leading-[20px]";
const BTN_13 = "text-[13px] font-medium";
const GRADIENT = {
  border: "1px solid rgba(240,240,240,0.2)",
  backgroundImage: "linear-gradient(93.1087deg, rgb(50,198,204) 0.1096%, rgb(178,52,149) 100.11%)",
};

const ERRORS: Record<string, string> = {
  auth_required: "Please sign in to send your answers.",
  no_access: "Enroll in this course to answer.",
  not_a_question_lesson: "This lesson has no questions yet.",
};

export default function QuestionForm({
  lesson,
  kind,
  signedIn,
  onCompleted,
}: {
  lesson: AcademyLesson;
  kind: "survey" | "quiz";
  signedIn: boolean;
  onCompleted: () => void;
}) {
  const questions: AcademyQuestion[] = lesson.questions ?? [];
  const [values, setValues] = useState<Record<string, Value>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Bring back what this learner sent before, and their last score.
  useEffect(() => {
    if (!signedIn || !lesson.id) return;
    let live = true;
    void (async () => {
      const [{ data: answers }, { data: res }] = await Promise.all([
        supabase.from("academy_answers").select("question_id, answer").eq("lesson_id", lesson.id!),
        supabase.from("academy_lesson_results").select("score, passed").eq("lesson_id", lesson.id!).maybeSingle(),
      ]);
      if (!live) return;
      if (answers && answers.length) {
        const v: Record<string, Value> = {};
        answers.forEach((a) => (v[a.question_id as string] = a.answer as Value));
        setValues(v);
        setSent(true);
      }
      if (res) setResult({ kind, score: res.score, pass_mark: 0, passed: res.passed, results: [] });
    })();
    return () => {
      live = false;
    };
  }, [signedIn, lesson.id, kind]);

  if (questions.length === 0) {
    return <p className={`${BODY_14} text-[#595C5C]`}>The questions for this lesson are being prepared.</p>;
  }

  const set = (id: string, v: Value) => {
    setValues((s) => ({ ...s, [id]: v }));
    setResult((r) => (r && r.results.length ? { ...r, results: [] } : r));
  };
  const filled = (v: Value | undefined) => (Array.isArray(v) ? v.length > 0 : Boolean(v && String(v).trim()));
  const complete = questions.every((q) => filled(values[q.id]));
  const verdict = (id: string) => result?.results.find((r) => r.question_id === id);

  const submit = async () => {
    if (!signedIn) {
      openLogin();
      return;
    }
    setBusy(true);
    setError("");
    const { data, error: err } = await supabase.rpc("academy_submit_answers", { p_lesson_id: lesson.id, p_answers: values });
    setBusy(false);
    if (err) {
      const code = Object.keys(ERRORS).find((k) => err.message.includes(k));
      setError(code ? ERRORS[code] : "Your answers could not be sent. Please try again.");
      return;
    }
    const r = data as Result;
    setResult(r);
    setSent(true);
    if (r.passed) onCompleted();
  };

  return (
    <div className="flex w-full flex-col gap-[22px] text-left">
      {questions.map((q, qi) => {
        const v = values[q.id];
        const mark = verdict(q.id);
        return (
          <fieldset key={q.id} className="flex flex-col gap-[10px]">
            <legend className="mb-[10px] flex items-start gap-[10px] text-[15px] font-medium leading-[22px] text-[#F0F0F0]">
              <span className="text-[#595C5C]">{qi + 1}.</span>
              <span className="flex-1">{q.prompt}</span>
              {mark && (
                <span className="shrink-0 text-[12px]" style={{ color: mark.correct ? "#32C6CC" : "#E0607E" }}>
                  {mark.correct ? "✓ Correct" : "✕ Not quite"}
                </span>
              )}
            </legend>

            {q.kind === "text" || q.options.length === 0 ? (
              <textarea
                value={typeof v === "string" ? v : ""}
                onChange={(e) => set(q.id, e.target.value)}
                placeholder="Your answer…"
                maxLength={4000}
                className={`h-[100px] w-full resize-none rounded-[6px] p-[14px] outline-none ${BTN_13} text-[#F0F0F0] placeholder:text-[#363636]`}
                style={{ background: "rgba(13,13,13,0.7)", border: "1px solid #363636" }}
              />
            ) : (
              <div role={q.kind === "multiple" ? "group" : "radiogroup"} className={`flex flex-wrap gap-[8px] ${q.kind === "scale" ? "" : "flex-col sm:flex-row"}`}>
                {q.options.map((o) => {
                  const on = q.kind === "multiple" ? Array.isArray(v) && v.includes(o.id) : v === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      role={q.kind === "multiple" ? "checkbox" : "radio"}
                      aria-checked={on}
                      onClick={() => {
                        if (q.kind === "multiple") {
                          const cur = Array.isArray(v) ? v : [];
                          set(q.id, on ? cur.filter((x) => x !== o.id) : [...cur, o.id]);
                        } else set(q.id, o.id);
                      }}
                      className={`rounded-[3px] px-[16px] py-[11px] text-left ${BTN_13} transition-colors`}
                      style={{
                        background: on ? "rgba(50,198,204,0.14)" : "rgba(13,13,13,0.7)",
                        border: `1px solid ${on ? "#32C6CC" : "#363636"}`,
                        color: on ? "#F0F0F0" : "#9D9C9C",
                        minWidth: q.kind === "scale" ? 48 : undefined,
                      }}
                    >
                      {q.kind === "multiple" && <span className="mr-[8px]">{on ? "☑" : "☐"}</span>}
                      {o.label}
                    </button>
                  );
                })}
              </div>
            )}
          </fieldset>
        );
      })}

      {result && kind === "quiz" && result.score !== null && (
        <div
          className="rounded-[6px] px-[16px] py-[12px]"
          style={{ background: result.passed ? "rgba(50,198,204,0.1)" : "rgba(224,96,126,0.1)", border: `1px solid ${result.passed ? "#32C6CC" : "#E0607E"}` }}
        >
          <p className="text-[15px] font-semibold text-[#F0F0F0]">
            {result.passed ? "Passed" : "Not passed yet"} — {result.score}%
          </p>
          {result.pass_mark > 0 && (
            <p className={`${BODY_14} text-[#9D9C9C]`}>
              {result.passed ? "Well done. This lesson is complete." : `You need ${result.pass_mark}% to pass. Change your answers and try again.`}
            </p>
          )}
        </div>
      )}
      {sent && kind === "survey" && <p className={`${BODY_14} text-[#32C6CC]`}>Thank you — your answers are saved. You can change them and send again.</p>}
      {error && <p className={`${BODY_14} text-[#E0607E]`}>{error}</p>}

      <button
        type="button"
        disabled={busy || (signedIn && !complete)}
        onClick={submit}
        className={`self-center flex w-full items-center justify-center gap-[7px] rounded-[3px] p-[14px] sm:w-[260px] ${BTN_13} text-[#F0F0F0] transition-opacity disabled:opacity-40`}
        style={GRADIENT}
      >
        {!signedIn ? "Sign in to answer" : busy ? "Sending…" : sent ? (kind === "quiz" ? "Try again" : "Update answers") : kind === "quiz" ? "Submit quiz" : "Submit"}
      </button>
    </div>
  );
}
