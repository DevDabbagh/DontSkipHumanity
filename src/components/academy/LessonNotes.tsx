"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { openLogin } from "@/lib/course-access";

/** Private notes, one per learner per lesson (academy_notes). Saved on the
 *  button and quietly a second after typing stops. */
const BTN_13 = "text-[13px] font-medium";
const BODY_14 = "font-[family-name:var(--font-source-sans)] text-[14px] leading-[20px]";

export default function LessonNotes({
  userId,
  lessonId,
  programId,
}: {
  userId: string | null;
  lessonId: string | undefined;
  programId: string;
}) {
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId || !lessonId) return;
    let live = true;
    supabase
      .from("academy_notes")
      .select("body")
      .eq("lesson_id", lessonId)
      .maybeSingle()
      .then(({ data }) => {
        if (!live) return;
        setText((data?.body as string) ?? "");
        setState("idle");
        setLoadedFor(lessonId);
      });
    return () => {
      live = false;
    };
  }, [userId, lessonId]);

  const save = async (body: string) => {
    if (!userId || !lessonId) return;
    setState("saving");
    const { error } = await supabase
      .from("academy_notes")
      .upsert({ user_id: userId, lesson_id: lessonId, program_id: programId, body, updated_at: new Date().toISOString() }, { onConflict: "user_id,lesson_id" });
    setState(error ? "error" : "saved");
  };

  if (!userId) {
    return (
      <div className="flex flex-col items-start gap-[12px]">
        <p className={`${BODY_14} text-[#8B8F8F]`}>Sign in to keep private notes for each lesson. Only you can see them.</p>
        <button type="button" onClick={openLogin} className={`rounded-[3px] px-[16px] py-[10px] ${BTN_13} text-[#F0F0F0]`} style={{ border: "1px solid #2A2A2A" }}>
          Sign in
        </button>
      </div>
    );
  }

  const ready = loadedFor === lessonId;
  return (
    <div className="flex flex-col items-end gap-[12px]">
      <textarea
        value={text}
        disabled={!ready}
        maxLength={20000}
        onChange={(e) => {
          const v = e.target.value;
          setText(v);
          setState("idle");
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => void save(v), 1200);
        }}
        placeholder={ready ? "Write your notes for this lesson… Only you can see them." : "Loading…"}
        className={`h-[180px] w-full resize-none rounded-[8px] p-[16px] outline-none ${BTN_13} text-[#F0F0F0] placeholder:text-[#363636]`}
        style={{ background: "#141414", border: "1px solid #1F1F1F" }}
      />
      <div className="flex items-center gap-[14px]">
        <span className="text-[12px] text-[#595C5C]">
          {state === "saving" ? "Saving…" : state === "saved" ? "Saved" : state === "error" ? "Not saved — try again" : ""}
        </span>
        <button
          type="button"
          disabled={!ready || state === "saving"}
          onClick={() => {
            if (timer.current) clearTimeout(timer.current);
            void save(text);
          }}
          className={`rounded-[3px] px-[18px] py-[10px] ${BTN_13} text-[#F0F0F0] transition-opacity disabled:opacity-40`}
          style={{ border: "1px solid rgba(240,240,240,0.2)", backgroundImage: "linear-gradient(93.1087deg, rgb(50,198,204) 0.1096%, rgb(178,52,149) 100.11%)" }}
        >
          Save notes
        </button>
      </div>
    </div>
  );
}
