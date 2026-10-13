"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { openLogin } from "@/lib/course-access";

/**
 * Lesson discussion. Read from academy_comments_public (author's display name
 * and avatar only); writing needs a signed-in learner who can open the lesson
 * — the database checks that, not this component.
 */
type Comment = { id: string; user_id: string; body: string; created_at: string; author_name: string; author_avatar: string | null };

const BTN_13 = "text-[13px] font-medium";
const BODY_14 = "font-[family-name:var(--font-source-sans)] text-[14px] leading-[20px]";

function ago(iso: string) {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function Avatar({ name, src }: { name: string; src: string | null }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="size-[32px] shrink-0 rounded-full object-cover" />
  ) : (
    <span className="flex size-[32px] shrink-0 items-center justify-center rounded-full text-[12px] font-semibold" style={{ background: "#1F1F1F", color: "#8B8F8F" }}>
      {(name || "?")[0].toUpperCase()}
    </span>
  );
}

export default function LessonComments({
  userId,
  lessonId,
  programId,
  canPost,
}: {
  userId: string | null;
  lessonId: string | undefined;
  programId: string;
  canPost: boolean;
}) {
  const [list, setList] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!lessonId) return;
    const { data } = await supabase
      .from("academy_comments_public")
      .select("id, user_id, body, created_at, author_name, author_avatar")
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: false })
      .limit(100);
    setList((data as Comment[]) ?? []);
    setLoading(false);
  }, [lessonId]);

  useEffect(() => {
    let live = true;
    if (lessonId)
      void supabase
        .from("academy_comments_public")
        .select("id, user_id, body, created_at, author_name, author_avatar")
        .eq("lesson_id", lessonId)
        .order("created_at", { ascending: false })
        .limit(100)
        .then(({ data }) => {
          if (!live) return;
          setList((data as Comment[]) ?? []);
          setLoading(false);
        });
    return () => {
      live = false;
    };
  }, [lessonId]);

  const post = async () => {
    const body = text.trim();
    if (!body || !userId || !lessonId) return;
    setBusy(true);
    setError("");
    const { error: err } = await supabase.from("academy_comments").insert({ lesson_id: lessonId, program_id: programId, user_id: userId, body });
    setBusy(false);
    if (err) {
      setError("Your comment could not be posted. Please try again.");
      return;
    }
    setText("");
    await load();
  };

  const remove = async (id: string) => {
    const { error: err } = await supabase.from("academy_comments").delete().eq("id", id);
    if (!err) setList((l) => l.filter((c) => c.id !== id));
  };

  return (
    <div className="flex flex-col gap-[18px]">
      {!userId ? (
        <div className="flex items-center gap-[12px]">
          <p className={`${BODY_14} text-[#8B8F8F]`}>Sign in to join the conversation.</p>
          <button type="button" onClick={openLogin} className={`rounded-[3px] px-[14px] py-[8px] ${BTN_13} text-[#F0F0F0]`} style={{ border: "1px solid #2A2A2A" }}>
            Sign in
          </button>
        </div>
      ) : !canPost ? (
        <p className={`${BODY_14} text-[#8B8F8F]`}>Enroll in this course to comment on its lessons.</p>
      ) : (
        <div className="flex items-start gap-[12px]">
          <span className="size-[32px] shrink-0 rounded-full" style={{ background: "#1F1F1F" }} />
          <div className="flex flex-1 flex-col items-end gap-[10px]">
            <textarea
              value={text}
              maxLength={2000}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment…"
              className={`h-[90px] w-full resize-none rounded-[8px] p-[14px] outline-none ${BTN_13} text-[#F0F0F0] placeholder:text-[#363636]`}
              style={{ background: "#141414", border: "1px solid #1F1F1F" }}
            />
            {error && <p className="self-start text-[12px] text-[#E0607E]">{error}</p>}
            <button
              type="button"
              disabled={!text.trim() || busy}
              onClick={post}
              className={`rounded-[3px] px-[16px] py-[10px] ${BTN_13} text-[#F0F0F0] transition-opacity disabled:opacity-40`}
              style={{ border: "1px solid rgba(240,240,240,0.2)", backgroundImage: "linear-gradient(93.1087deg, rgb(50,198,204) 0.1096%, rgb(178,52,149) 100.11%)" }}
            >
              {busy ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className={`${BODY_14} text-[#363636]`}>Loading comments…</p>
      ) : list.length === 0 ? (
        <p className={`${BODY_14} text-[#595C5C]`}>No comments yet. Be the first to share a thought.</p>
      ) : (
        list.map((c) => (
          <div key={c.id} className="flex items-start gap-[12px]">
            <Avatar name={c.author_name} src={c.author_avatar} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-[#F0F0F0]">
                {c.author_name} <span className="ml-[6px] text-[11px] font-normal text-[#595C5C]">{ago(c.created_at)}</span>
              </p>
              <p className={`${BODY_14} mt-[4px] whitespace-pre-line break-words text-[#9D9C9C]`}>{c.body}</p>
            </div>
            {c.user_id === userId && (
              <button type="button" onClick={() => void remove(c.id)} className="shrink-0 text-[12px] text-[#595C5C] hover:text-[#E0607E]">
                Delete
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
