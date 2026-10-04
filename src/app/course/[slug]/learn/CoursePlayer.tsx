"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import DshPlayer from "@/components/DshPlayer";
import InstructorChip from "@/components/InstructorChip";
import { useLocaleHref } from "@/contexts/LocaleContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import CertificateClaim from "@/components/CertificateClaim";
import { videoThumbnailUrl } from "@/lib/video-url";
import type { AcademyProgram, AcademyLesson } from "@/lib/types";

/** What a lesson row says instead of a running time, by type. */
const KIND_LABEL: Record<string, string> = {
  survey: "Survey",
  quiz: "Quiz",
  page: "Reading",
  link: "Link",
  file: "File",
  certificate: "Certificate",
};

/** Lessons from before migration 047 carry no type; they were always videos. */
const kindOf = (l: AcademyLesson | undefined) => l?.type ?? "video";

/**
 * Academy — lesson details.
 *
 * LAYOUT — decided by Ahmed, 4 Oct 2026
 *
 * The playlist layout of "Designer/Design Academy Section Pages" (PagePlayer):
 * a 70/30 split with the lesson list in collapsible modules, progress on top,
 * and Resources / Notes / Comments as tabs under the stage — but with the
 * playlist on the LEFT. With 24 real courses of 5–21 lessons each (imported
 * from LearnWorlds), a list beside the video reads far better than the long
 * stacked page of Figma frame `853:2059`, which this replaces. Logged in
 * DSH-Figma-Comments-Report.md so the change from that frame is on record.
 *
 * The type ramp and icons below are still the frame's.
 */

/* ── Type ramp, straight from the frame's named styles ────────────────
   H6_IntroTitles   Inter 400 · 11/24 · 1.76px · uppercase  (section eyebrows)
   H4_Desktop_DSH   Inter 600 · 26/26 · -0.75px             (lesson title)
   Body-Medium      Source Sans 3 400 · 16/24 · -0.08px
   Body-Small       Source Sans 3 400 · 14/20
   Btn_SM-Destop-Med Inter 500 · 13                          (row controls) */

const EYEBROW =
  "text-[11px] font-normal leading-[24px] tracking-[1.76px] uppercase text-[#363636]";
const BODY_16 =
  "font-[family-name:var(--font-source-sans)] text-[16px] leading-[24px] tracking-[-0.08px]";
const BODY_14 =
  "font-[family-name:var(--font-source-sans)] text-[14px] leading-[20px]";
const BTN_13 = "text-[13px] font-medium";

/* ── Icons ────────────────────────────────────────────────────────────
   Drawn here rather than linked: Figma's exported asset URLs expire after
   seven days, so a build that referenced them would break silently a week
   later. Sizes match the frame exactly. */

function PlaySmallIcon() {
  // 20×20 (849:1485)
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="9.2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M8.2 6.8l5 3.2-5 3.2V6.8z" fill="currentColor" />
    </svg>
  );
}

function CheckCircleIcon({ filled }: { filled: boolean }) {
  /* A 20px ring with an 11px check inside (849:1474 / 849:1475). The ring is
     always the Academy teal; the fill is what says "done". */
  return (
    <span
      className="flex items-center justify-center rounded-full border border-solid size-[20px] p-px transition-colors"
      style={{ borderColor: "#32C6CC", background: filled ? "#32C6CC" : "transparent" }}
    >
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
        <path
          d="M2 5.6l2.4 2.4L9 3.2"
          stroke={filled ? "#0D0D0D" : "#32C6CC"}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function LockIcon({ size = 24 }: { size?: number }) {
  // 24×24 in the rows (849:1276); 60×60 over a locked video
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="11.2" stroke="currentColor" strokeWidth="1.1" />
      <rect x="7.8" y="11" width="8.4" height="6.4" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M9.7 11V9.4a2.3 2.3 0 014.6 0V11" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon({ size = 14 }: { size?: number }) {
  // 14×14 (853:1950)
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 1.5v8m0 0L4 6.6M7 9.5l3-2.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1.8 10.4v1a1.6 1.6 0 001.6 1.6h7.2a1.6 1.6 0 001.6-1.6v-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function PublishIcon() {
  // 12.476×12.476 (853:2026)
  return (
    <svg width="12.476" height="12.476" viewBox="0 0 13 13" fill="none" aria-hidden>
      <path d="M9.1 1.6l2.3 2.3-6.6 6.6-3 .7.7-3 6.6-6.6z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

/* Running time and locked state come from the programme record (migration
   031). A lesson with no duration simply shows no time — the row does not
   invent one. */

/* ── One resource row — Frame 796 (853:1941 open, 853:1967 locked) ────
   A locked file is not a link: it has nothing to download yet, so it points at
   the course page where access is arranged rather than opening a dead tab. */
function ResourceRow({
  file,
  unlockHref,
}: {
  file: AcademyProgram["resources"][number];
  unlockHref: string;
}) {
  const meta = file.sizeLabel
    ? `${file.type.toUpperCase()} · ${file.sizeLabel}`
    : file.type.toUpperCase();

  const inner = (
    <>
      <span className="flex gap-[12px] items-center min-w-0">
        <span
          className="px-[8px] py-[2px] rounded-[3px] text-[10px] font-bold leading-[15px] tracking-[0.1172px] shrink-0"
          style={
            file.locked
              ? { background: "#363636", color: "#595C5C" }
              : { background: "rgba(50,198,204,0.2)", color: "#32C6CC" }
          }
        >
          {file.type.toUpperCase()}
        </span>
        <span
          className={`${BODY_14} truncate`}
          style={{ color: file.locked ? "#363636" : "#595C5C" }}
        >
          {file.title}
        </span>
      </span>
      <span className="flex gap-[12px] items-center shrink-0 text-[#363636]">
        <span className="text-[12px] leading-[18px]">{meta}</span>
        {file.locked ? <LockIcon /> : <DownloadIcon />}
      </span>
    </>
  );

  const className =
    "flex items-center justify-between gap-[20px] px-[20px] py-[14px] rounded-[6px] transition-colors hover:bg-[rgba(27,27,27,0.7)]";
  const style = { background: "rgba(27,27,27,0.4)" };

  if (file.locked) {
    return (
      <Link href={unlockHref} className={className} style={style}>
        {inner}
      </Link>
    );
  }
  /* Seed rows ship `url: "#"`. Rendered as a link that is a blank tab, so a
     file with no address is shown but is not clickable. */
  if (!file.url || file.url === "#") {
    return (
      <div className={className} style={style}>
        {inner}
      </div>
    );
  }
  return (
    <a href={file.url} target="_blank" rel="noopener noreferrer" className={className} style={style}>
      {inner}
    </a>
  );
}

/** A link lesson that is a YouTube or Spotify player is shown in place, with
 *  a way out to the provider. Anything else stays an "Open ↗" button. */
function embedOf(url: string): { src: string; open: string; provider: string; height: number } | null {
  const yt = url.match(/^https:\/\/www\.youtube(?:-nocookie)?\.com\/embed\/([\w-]{6,})/);
  if (yt) {
    return {
      src: `https://www.youtube-nocookie.com/embed/${yt[1]}`,
      open: `https://www.youtube.com/watch?v=${yt[1]}`,
      provider: "YouTube",
      height: 315,
    };
  }
  const sp = url.match(/^https:\/\/open\.spotify\.com\/embed\/(episode|show|playlist|track|album)\/(\w+)/);
  if (sp) {
    return {
      src: `https://open.spotify.com/embed/${sp[1]}/${sp[2]}`,
      open: `https://open.spotify.com/${sp[1]}/${sp[2]}`,
      provider: "Spotify",
      height: sp[1] === "playlist" || sp[1] === "show" ? 352 : 232,
    };
  }
  return null;
}

/* ── What sits in the video frame when the lesson is not a video ─────
   Every imported course has surveys, a reading page, links and a certificate
   (DSH-Academy-Migration-Inventory.md). Showing a play button over a survey
   would be a control that lies; each type gets the panel it needs. */
function LessonPanel({
  lesson,
  kind,
  isDone,
  answer,
  setAnswer,
  remaining,
  onComplete,
  program,
}: {
  program: AcademyProgram;
  lesson: AcademyLesson | undefined;
  kind: string;
  isDone: boolean;
  answer: string;
  setAnswer: (v: string) => void;
  remaining: number;
  onComplete: () => void;
}) {
  const wrap =
    "relative flex flex-col items-center gap-[18px] text-center w-full max-w-[640px] px-[24px] py-[40px]";
  const title = (
    <p className="text-[20px] font-semibold leading-[28px] tracking-[-0.5px] text-[#F0F0F0]">
      {lesson?.title}
    </p>
  );
  const primary =
    "flex gap-[7px] items-center justify-center w-full sm:w-[260px] p-[14px] rounded-[3px] text-[13px] font-medium text-[#F0F0F0] transition-opacity disabled:opacity-40";
  const primaryStyle = {
    border: "1px solid rgba(240,240,240,0.2)",
    backgroundImage: "linear-gradient(93.1087deg, rgb(50,198,204) 0.1096%, rgb(178,52,149) 100.11%)",
  };

  if (kind === "survey" || kind === "quiz") {
    return (
      <div className={wrap}>
        <p className={EYEBROW}>{KIND_LABEL[kind]}</p>
        {title}
        {isDone ? (
          /* Worded so it promises nothing: answers are not stored yet. The
             academy_answers table exists (047); saving into it needs a
             signed-in, enrolled learner, which is the next piece of work. */
          <p className={`${BODY_14} text-[#32C6CC]`}>Thank you for your answer.</p>
        ) : (
          <>
            {/* The options captured from LearnWorlds (049): SIM/NÃO, or the
                1–4 scale. One choice per survey, kept in `answer` like the
                free-text fallback below so Submit behaves the same. */}
            {lesson?.questions?.[0]?.options.length ? (
              <div role="radiogroup" aria-label={lesson.questions[0].prompt} className="flex flex-wrap justify-center gap-[10px] w-full">
                {lesson.questions[0].options.map((o) => {
                  const on = answer === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setAnswer(o.id)}
                      className={`px-[18px] py-[12px] rounded-[3px] ${BTN_13} transition-colors`}
                      style={{
                        background: on ? "rgba(50,198,204,0.14)" : "rgba(13,13,13,0.7)",
                        border: `1px solid ${on ? "#32C6CC" : "#363636"}`,
                        color: on ? "#F0F0F0" : "#9D9C9C",
                      }}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Your answer…"
                className={`w-full h-[110px] p-[16px] rounded-[6px] resize-none outline-none ${BTN_13} text-[#F0F0F0] placeholder:text-[#363636] text-left`}
                style={{ background: "rgba(13,13,13,0.7)", border: "1px solid #363636" }}
              />
            )}
            <button type="button" disabled={!answer.trim()} onClick={onComplete} className={primary} style={primaryStyle}>
              Submit
            </button>
          </>
        )}
      </div>
    );
  }

  if (kind === "link" || kind === "file") {
    const embed = lesson?.url ? embedOf(lesson.url) : null;
    return (
      <div className={wrap}>
        <p className={EYEBROW}>{KIND_LABEL[kind]}</p>
        {title}
        {embed ? (
          /* LearnWorlds showed these 42 YouTube talks and Spotify episodes
             inside the lesson; so do we. Opening it counts as done. */
          <>
            <iframe
              src={embed.src}
              title={lesson?.title ?? ""}
              className="w-full rounded-[6px] border-0"
              style={{ height: embed.height }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              loading="lazy"
              onLoad={onComplete}
            />
            <a href={embed.open} target="_blank" rel="noopener noreferrer" className={`${BODY_14} text-[#32C6CC]`}>
              Open on {embed.provider} ↗
            </a>
          </>
        ) : lesson?.url ? (
          <a
            href={lesson.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onComplete}
            className={primary}
            style={primaryStyle}
          >
            Open ↗
          </a>
        ) : (
          /* Every imported link has its address since the 4 Oct capture; this
             only shows for a link an editor adds without one. */
          <p className={`${BODY_14} text-[#595C5C]`}>This link is being prepared.</p>
        )}
      </div>
    );
  }

  if (kind === "page") {
    const blocks = lesson?.body ?? [];
    return (
      <div className={`${wrap} text-left items-stretch`}>
        <p className={`${EYEBROW} text-center`}>{KIND_LABEL.page}</p>
        <div className="text-center">{title}</div>
        {blocks.length === 0 ? (
          <p className={`${BODY_14} text-[#595C5C] text-center`}>This reading is being prepared.</p>
        ) : (
          <div className="flex flex-col gap-[16px] max-h-[360px] overflow-y-auto pr-[8px]">
            {blocks.map((b) =>
              b.type === "heading" ? (
                <h3 key={b.id} className="text-[17px] font-semibold text-[#F0F0F0]">{b.content}</h3>
              ) : b.type === "quote" ? (
                <blockquote key={b.id} className={`${BODY_16} italic text-[#F0F0F0] border-l-2 border-[#32C6CC] pl-[14px]`}>
                  {b.content}
                </blockquote>
              ) : b.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={b.id} src={b.content} alt={b.caption ?? ""} className="w-full rounded-[6px]" />
              ) : b.type === "html" ? (
                /* Editor-authored, rendered the same way the Read article page
                   renders its HTML block. */
                <div key={b.id} className={`${BODY_16} text-[#9D9C9C] [&_a]:text-[#32C6CC]`} dangerouslySetInnerHTML={{ __html: b.content }} />
              ) : b.type === "divider" ? (
                <hr key={b.id} className="border-[#363636]" />
              ) : (
                <p key={b.id} className={`${BODY_16} text-[#9D9C9C]`}>{b.content}</p>
              )
            )}
          </div>
        )}
        {!isDone && blocks.length > 0 && (
          <button type="button" onClick={onComplete} className={`${primary} self-center`} style={primaryStyle}>
            Mark as read
          </button>
        )}
      </div>
    );
  }

  if (kind === "certificate") {
    return (
      <div className={wrap}>
        <p className={EYEBROW}>{KIND_LABEL.certificate}</p>
        {title}
        <div className="w-full text-left">
          <CertificateClaim program={program} remaining={remaining} />
        </div>
      </div>
    );
  }

  return null;
}

export default function CoursePlayer({
  program,
  lessonIndex,
}: {
  program: AcademyProgram;
  lessonIndex: number;
}) {
  const href = useLocaleHref();

  const lessons: AcademyLesson[] = program.lessons;

  const total = lessons.length;
  const current = Math.min(Math.max(lessonIndex, 0), Math.max(total - 1, 0));
  const lesson = lessons[current];
  /* This lesson's own files first, then the ones for the whole course. */
  const lessonResources = [
    ...program.resources.filter((r) => lesson && r.lessonId === lesson.id),
    ...program.resources.filter((r) => !r.lessonId),
  ];
  /* A locked lesson does not play. The page still shows everything around it —
     the curriculum, the resources, the notes — so a visitor can see what they
     would be joining rather than hitting a wall. */
  const lockedNow = Boolean(lesson?.locked);

  /* Completion. For a signed-in learner every change is saved to their
     account (academy_lesson_progress) and read back on the next visit; for a
     visitor it lives in this tab only. The server decides certificates from
     the saved rows, never from this set. */
  const [done, setDone] = useState<Set<number>>(new Set());
  const { user } = useAuth();
  const enrolled = useRef(false);
  const doneRef = useRef(done);
  useEffect(() => {
    doneRef.current = done;
  });

  const persist = useCallback(
    async (i: number, completed: boolean) => {
      const l = lessons[i];
      if (!user || !l?.id || !program.id) return;
      if (!enrolled.current) {
        // Free courses: join on first progress. Paid courses are joined at
        // checkout, so "not free" here is expected and harmless.
        await supabase.rpc("academy_enroll_learner", { p_program_id: program.id });
        enrolled.current = true;
      }
      const { error } = await supabase.from("academy_lesson_progress").upsert(
        { user_id: user.id, lesson_id: l.id, program_id: program.id, completed_at: completed ? new Date().toISOString() : null, updated_at: new Date().toISOString() },
        { onConflict: "user_id,lesson_id" }
      );
      if (error) console.warn("[academy] progress not saved:", error.message);
    },
    [user, lessons, program.id]
  );

  // Signed in: load saved progress, and save anything done before signing in.
  useEffect(() => {
    if (!user || !program.id) return;
    let live = true;
    supabase
      .from("academy_lesson_progress")
      .select("lesson_id, completed_at")
      .eq("program_id", program.id)
      .then(({ data }) => {
        if (!live || !data) return;
        const savedIds = new Set(data.filter((r) => r.completed_at).map((r) => r.lesson_id as string));
        const fromServer = new Set<number>();
        lessons.forEach((l, i) => l.id && savedIds.has(l.id) && fromServer.add(i));
        const local = doneRef.current;
        local.forEach((i) => {
          if (!fromServer.has(i)) void persist(i, true);
        });
        setDone(new Set([...fromServer, ...local]));
      });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, program.id]);
  /* `key={current}` on the player unmounts the old lesson's player — and stops
     its download — when the lesson changes. */
  /* Theater: the playlist steps aside and the stage takes the full width. */
  const [theater, setTheater] = useState(false);
  const router = useRouter();
  /* The lesson the page opened on waits for a click; every lesson reached
     from inside the player (Next, the playlist, "Up next") starts playing on
     its own — the learner has already chosen to keep watching. */
  const [firstLesson] = useState(current);
  /* "Up next" countdown after a video ends, in seconds; null = hidden. */
  const [upNext, setUpNext] = useState<number | null>(null);
  const goNext = () => {
    setUpNext(null);
    if (current < total - 1) router.push(href(`/course/${program.slug}/learn?lesson=${current + 1}`), { scroll: false });
  };
  useEffect(() => {
    if (upNext === null) return;
    const t = setTimeout(() => {
      if (upNext <= 1) goNext();
      else setUpNext(upNext - 1);
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upNext]);
  // A new lesson clears any countdown left from the last one.
  const [shownLesson, setShownLesson] = useState(current);
  if (shownLesson !== current) {
    setShownLesson(current);
    setUpNext(null);
  }
  const [answer, setAnswer] = useState("");
  const markDone = (i: number) => {
    if (!doneRef.current.has(i)) void persist(i, true);
    setDone((d) => new Set(d).add(i));
  };
  const toggleDone = (i: number) => {
    const was = doneRef.current.has(i);
    void persist(i, !was);
    setDone((d) => {
      const next = new Set(d);
      if (was) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const kind = kindOf(lesson);
  const playable = kind === "video" && Boolean(lesson?.videoUrl) && !lockedNow;
  const poster =
    (lesson?.videoGuid ? videoThumbnailUrl("bunny", lesson.videoGuid) : "") || program.thumbnailUrl;
  const sections = program.sections ?? [];
  const [tab, setTab] = useState<"resources" | "notes" | "comments">("resources");
  const [noteText, setNoteText] = useState("");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<{ name: string; text: string }[]>([]);

  const percent = total > 0 ? Math.round((done.size / total) * 100) : 0;
  const courseHref = href(`/course/${program.slug}`);
  const lessonHref = (i: number) => href(`/course/${program.slug}/learn?lesson=${i}`);

  /* The playlist groups lessons by section; a course from before 047 has no
     sections and becomes one group. Indices stay global so ?lesson=N and the
     completion set mean the same thing everywhere. */
  const groups: { title: string; items: number[] }[] =
    sections.length > 0
      ? sections.map((s, si) => ({
          title: s.title,
          items: lessons.map((l, i) => (l.sectionIndex === si ? i : -1)).filter((i) => i >= 0),
        }))
      : [{ title: "Lessons", items: lessons.map((_, i) => i) }];
  const currentGroup = Math.max(
    0,
    groups.findIndex((g) => g.items.includes(current))
  );
  /* The current lesson's module starts open; the others can be opened. */
  const [open, setOpen] = useState<Set<number>>(new Set([currentGroup]));
  const toggleGroup = (g: number) =>
    setOpen((o) => {
      const next = new Set(o);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });

  const sectionTitle =
    lesson?.sectionIndex !== undefined && sections[lesson.sectionIndex]
      ? sections[lesson.sectionIndex].title
      : "";

  const gradientBtn = {
    border: "1px solid rgba(240,240,240,0.2)",
    backgroundImage: "linear-gradient(93.1087deg, rgb(50,198,204) 0.1096%, rgb(178,52,149) 100.11%)",
  };

  /* ── Playlist (left) ──────────────────────────────────────────────── */
  const playlist = (
    <aside
      className={`w-full hide-scrollbar ${theater ? "overflow-hidden rounded-[12px]" : "lg:h-full lg:overflow-y-auto"}`}
      style={{ background: "#121212", ...(theater ? { border: "1px solid #1F1F1F" } : { borderRight: "1px solid #1F1F1F", borderTop: "1px solid #1F1F1F" }) }}
    >
      {/* Course + back */}
      <div className="px-[24px] pt-[28px] pb-[22px]" style={{ borderBottom: "1px solid #1F1F1F" }}>
        <Link
          href={courseHref}
          className={`flex w-fit items-center gap-[7px] ${BTN_13} text-[#595C5C] hover:text-[#8B8F8F] transition-colors`}
        >
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden>
            <path d="M11 4H1M1 4L4 1M1 4L4 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Course page
        </Link>
        <p className="mt-[16px] text-[17px] font-semibold leading-[23px] tracking-[-0.3px] text-[#F0F0F0]">
          {program.title}
        </p>
        {program.instructors && program.instructors.length > 0 ? (
          <div className="flex flex-col gap-[10px] mt-[14px]">
            {program.instructors.map((i) => (
              <InstructorChip key={i.slug} instructor={i} size={32} />
            ))}
          </div>
        ) : (
          program.whoLeads && <p className={`${BODY_14} mt-[4px] text-[#595C5C]`}>{program.whoLeads}</p>
        )}
      </div>

      {/* Progress */}
      <div className="px-[24px] py-[20px]" style={{ borderBottom: "1px solid #1F1F1F" }}>
        <p className={`${EYEBROW} text-[#595C5C]`}>Your progress</p>
        <div className="mt-[10px] w-full h-[6px] rounded-full overflow-hidden" style={{ background: "#1F1F1F" }}>
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${percent}%`, background: "linear-gradient(to right, #32C6CC, #B23495)" }}
          />
        </div>
        <div className="flex items-center justify-between pt-[10px]">
          <span className="text-[12px] leading-[18px] text-[#8B8F8F]">{percent}% complete</span>
          <span className="text-[12px] leading-[18px] text-[#595C5C]">
            {done.size} of {total} lessons
          </span>
        </div>
      </div>

      {/* Modules */}
      {groups.map((g, gi) => {
        const isOpen = open.has(gi);
        const groupDone = g.items.filter((i) => done.has(i)).length;
        return (
          <div key={gi} style={{ borderBottom: "1px solid #1F1F1F" }}>
            <button
              type="button"
              onClick={() => toggleGroup(gi)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-[12px] px-[24px] py-[16px] text-left transition-colors hover:bg-[#161616]"
            >
              <span className="min-w-0">
                <span className="block text-[11px] leading-[18px] tracking-[1.76px] uppercase text-[#32C6CC]">
                  Module {String(gi + 1).padStart(2, "0")}
                </span>
                <span className="block text-[14px] font-medium leading-[20px] text-[#F0F0F0] truncate">{g.title}</span>
                <span className="block text-[12px] leading-[18px] text-[#595C5C] mt-[2px]">
                  {groupDone}/{g.items.length} lessons
                </span>
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
                className="shrink-0 text-[#595C5C] transition-transform duration-200"
                style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
              >
                <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isOpen && (
              <ul>
                {g.items.map((i) => {
                  const l = lessons[i];
                  const k = kindOf(l);
                  const isCurrent = i === current;
                  const isDone = done.has(i);
                  return (
                    <li key={l.id ?? i}>
                      <Link
                        href={lessonHref(i)}
                        scroll={false}
                        aria-current={isCurrent ? "true" : undefined}
                        className="mx-[10px] mb-[2px] flex items-center gap-[12px] rounded-[8px] px-[12px] py-[11px] transition-colors hover:bg-[#1A1A1A]"
                        style={{
                          background: isCurrent ? "rgba(50,198,204,0.09)" : undefined,
                          boxShadow: isCurrent ? "inset 2px 0 0 #32C6CC" : undefined,
                        }}
                      >
                        <span
                          className="shrink-0 flex items-center justify-center w-[20px]"
                          style={{ color: l.locked ? "#363636" : isCurrent ? "#32C6CC" : "#595C5C" }}
                        >
                          {l.locked ? (
                            <LockIcon size={16} />
                          ) : isDone ? (
                            <CheckCircleIcon filled />
                          ) : (
                            <PlaySmallIcon />
                          )}
                        </span>
                        <span
                          className="flex-1 min-w-0 text-[13px] leading-[18px]"
                          style={{ color: l.locked ? "#363636" : isCurrent ? "#F0F0F0" : isDone ? "#8B8F8F" : "#C9C9C9" }}
                        >
                          {l.title}
                        </span>
                        <span className="shrink-0 text-[11px] leading-[16px] text-[#595C5C]">
                          {k === "video" ? l.duration : KIND_LABEL[k] ?? k}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </aside>
  );

  /* ── The video box and the lesson below it ───────────────────────── */
  const videoBox = (
        <div
          className={`relative flex items-center justify-center overflow-hidden w-full ${theater ? "" : "rounded-[10px]"}`}
          style={{
            /* A video keeps 16:9. A survey or a reading keeps the width and
               lets the height follow its content. */
            aspectRatio: kind === "video" || lockedNow ? "16 / 9" : undefined,
            minHeight: kind === "video" || lockedNow ? undefined : 360,
            background: "#0D0D0D",
            border: theater ? "none" : "1px solid rgba(240,240,240,0.08)",
          }}
        >
          {playable ? (
            /* The Studio player: quality, speed, theater, fullscreen. It loads
               only the playlist until the first play — see DshPlayer. */
            <DshPlayer
              key={current}
              src={lesson!.videoUrl}
              poster={poster}
              title={lesson?.title}
              theater={theater}
              onTheaterChange={setTheater}
              autoPlay={current !== firstLesson}
              onEnded={() => {
                markDone(current);
                if (current < total - 1 && !lessons[current + 1]?.locked) setUpNext(5);
              }}
            />
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={kind === "video" ? poster : program.thumbnailUrl}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: kind === "video" ? 0.8 : 0.14 }}
              />

              {lockedNow ? (
                <Link
                  href={courseHref}
                  className="relative flex flex-col items-center gap-[14px] text-[#F0F0F0] transition-opacity hover:opacity-80"
                >
                  <span className="opacity-90">
                    <LockIcon size={60} />
                  </span>
                  <span className={BTN_13}>Unlock this lesson</span>
                </Link>
              ) : kind === "video" ? (
                <p className={`relative ${BODY_14} text-[#F0F0F0] px-[24px] text-center`}>
                  This video is being prepared.
                </p>
              ) : (
                <LessonPanel
                  program={program}
                  lesson={lesson}
                  kind={kind}
                  isDone={done.has(current)}
                  answer={answer}
                  setAnswer={setAnswer}
                  remaining={lessons.filter((l, i) => !done.has(i) && !["link", "certificate"].includes(kindOf(l))).length}
                  onComplete={() => {
                    markDone(current);
                    setAnswer("");
                  }}
                />
              )}
            </>
          )}
          {upNext !== null && current < total - 1 && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-[14px] bg-black/75 px-6 text-center backdrop-blur-[2px]">
              <p className="text-[11px] uppercase tracking-[1.76px] text-[#8B8F8F]">Up next in {upNext}s</p>
              <p className="max-w-[520px] text-[18px] font-semibold leading-[24px] text-[#F0F0F0]">{lessons[current + 1]?.title}</p>
              <div className="flex gap-[10px]">
                <button type="button" onClick={() => setUpNext(null)} className={`px-[16px] py-[10px] rounded-[3px] ${BTN_13} text-[#8B8F8F] hover:text-[#F0F0F0]`} style={{ border: "1px solid #2A2A2A" }}>
                  Stay here
                </button>
                <button type="button" onClick={goNext} className={`px-[16px] py-[10px] rounded-[3px] ${BTN_13} text-[#F0F0F0]`} style={gradientBtn}>
                  Play now →
                </button>
              </div>
            </div>
          )}
        </div>
  );

  const crumb = (
    <p className="text-[12px] leading-[18px] text-[#595C5C] pb-[14px]">
      {sectionTitle ? `${sectionTitle} › ` : ""}Lesson {current + 1} of {total}
    </p>
  );

  const info = (
    <div>
        {/* Title, instructor, actions */}
        <div className="flex flex-col gap-[16px] pt-[24px] lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-[24px] font-semibold leading-[30px] tracking-[-0.6px] text-[#F0F0F0]">
              {lesson?.title ?? program.title}
            </h1>
            {program.whoLeads && <p className={`${BODY_14} mt-[6px] text-[#8B8F8F]`}>{program.whoLeads}</p>}
          </div>
          <div className="flex items-center gap-[10px] shrink-0 flex-wrap">
            {current > 0 && (
              <Link
                href={lessonHref(current - 1)}
                scroll={false}
                className={`px-[14px] py-[10px] rounded-[3px] ${BTN_13} text-[#8B8F8F] hover:text-[#F0F0F0] transition-colors`}
                style={{ border: "1px solid #2A2A2A" }}
              >
                ← Previous
              </Link>
            )}
            {!lockedNow && (
              <button
                type="button"
                onClick={() => toggleDone(current)}
                aria-pressed={done.has(current)}
                className={`flex items-center gap-[8px] px-[14px] py-[10px] rounded-[3px] ${BTN_13} transition-colors`}
                style={{ border: "1px solid #2A2A2A", color: done.has(current) ? "#F0F0F0" : "#8B8F8F" }}
              >
                <CheckCircleIcon filled={done.has(current)} />
                {done.has(current) ? "Completed" : "Mark complete"}
              </button>
            )}
            {current < total - 1 && (
              <Link
                href={lessonHref(current + 1)}
                scroll={false}
                onClick={() => !lockedNow && markDone(current)}
                className={`px-[16px] py-[10px] rounded-[3px] ${BTN_13} text-[#F0F0F0]`}
                style={gradientBtn}
              >
                Next lesson →
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-[28px] mt-[32px]" style={{ borderBottom: "1px solid #1F1F1F" }}>
          {(["resources", "notes", "comments"] as const).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`relative pb-[12px] ${BTN_13} transition-colors`}
                style={{ color: active ? "#F0F0F0" : "#595C5C" }}
              >
                {t === "resources" ? "Resources" : t === "notes" ? "Notes" : "Comments"}
                {active && <span className="absolute left-0 right-0 bottom-[-1px] h-[2px] bg-[#32C6CC]" />}
              </button>
            );
          })}
        </div>

        <div className="pt-[20px]">
          {tab === "resources" &&
            (lessonResources.length === 0 ? (
              <p className={`${BODY_14} text-[#595C5C]`}>
                {program.description || "No resources have been attached to this course yet."}
              </p>
            ) : (
              <div className="flex flex-col gap-[10px]">
                {lessonResources.map((file) => (
                  <ResourceRow key={file.id} file={file} unlockHref={courseHref} />
                ))}
              </div>
            ))}

          {tab === "notes" && (
            <div className="flex flex-col gap-[14px] items-end">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write your notes for this lesson..."
                className={`w-full h-[160px] p-[16px] rounded-[8px] resize-none outline-none ${BTN_13} text-[#F0F0F0] placeholder:text-[#363636]`}
                style={{ background: "#141414", border: "1px solid #1F1F1F" }}
              />
              <button
                type="button"
                disabled={!noteText.trim()}
                onClick={() => setNoteText("")}
                className={`flex gap-[7px] items-center justify-center w-full sm:w-[220px] p-[12px] rounded-[3px] ${BTN_13} text-[#F0F0F0] transition-opacity disabled:opacity-40`}
                style={gradientBtn}
              >
                Save notes
                <PublishIcon />
              </button>
            </div>
          )}

          {tab === "comments" && (
            <div className="flex flex-col gap-[18px]">
              <div className="flex gap-[12px] items-start">
                <span className="shrink-0 size-[32px] rounded-full" style={{ background: "#1F1F1F" }} />
                <div className="flex-1 flex flex-col gap-[10px] items-end">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className={`w-full h-[90px] p-[14px] rounded-[8px] resize-none outline-none ${BTN_13} text-[#F0F0F0] placeholder:text-[#363636]`}
                    style={{ background: "#141414", border: "1px solid #1F1F1F" }}
                  />
                  <button
                    type="button"
                    disabled={!commentText.trim()}
                    onClick={() => {
                      const text = commentText.trim();
                      if (!text) return;
                      setComments((c) => [{ name: "You", text }, ...c]);
                      setCommentText("");
                    }}
                    className={`px-[16px] py-[10px] rounded-[3px] ${BTN_13} text-[#F0F0F0] transition-opacity disabled:opacity-40`}
                    style={gradientBtn}
                  >
                    Post
                  </button>
                </div>
              </div>
              {comments.map((c, i) => (
                <div key={i} className="flex gap-[12px] items-start">
                  <span
                    className="shrink-0 size-[32px] rounded-full flex items-center justify-center text-[12px] font-semibold"
                    style={{ background: "#1F1F1F", color: "#8B8F8F" }}
                  >
                    {c.name[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#F0F0F0]">{c.name}</p>
                    <p className={`${BODY_14} text-[#8B8F8F] mt-[4px]`}>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );

  return (
    <main className="relative bg-[#0D0D0D] min-h-screen">
      <div className="film-grain" />
      <Navbar />
      {theater ? (
        /* Theater — the picture runs the full width of the window (capped
           so the whole frame and its controls fit on screen), and the course
           continues underneath: playlist on the left, the lesson on the right. */
        <div className="relative pt-[100px]">
          <div className="w-full bg-black">
            <div className="mx-auto w-full" style={{ maxWidth: "calc((100vh - 100px) * 16 / 9)" }}>
              {videoBox}
            </div>
          </div>
          <div className="mx-auto grid max-w-[1600px] gap-[32px] px-5 pb-[80px] pt-[28px] sm:px-8 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="order-2 lg:order-1">{playlist}</div>
            <div className="order-1 min-w-0 lg:order-2">
              {crumb}
              {info}
            </div>
          </div>
        </div>
      ) : (
        /* Default — on a laptop an app-like screen: the playlist and the
           lesson scroll on their own and the page does not. On a phone it is
           one column — the lesson first, the course content under it. */
        <div className="relative pt-[100px] lg:grid lg:h-screen lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="order-2 lg:order-1 lg:h-full lg:min-h-0">{playlist}</div>
          <section className="order-1 min-w-0 lg:order-2 lg:h-full lg:overflow-y-auto hide-scrollbar">
            <div className="mx-auto max-w-[1320px] px-0 pb-[80px] sm:px-8 sm:pt-[24px]">
              <div className="hidden sm:block">{crumb}</div>
              {videoBox}
              <div className="px-5 sm:px-0">{info}</div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
