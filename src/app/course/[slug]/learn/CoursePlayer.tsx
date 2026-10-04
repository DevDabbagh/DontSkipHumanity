"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import LessonVideo from "@/components/LessonVideo";
import { useLocaleHref } from "@/contexts/LocaleContext";
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
 * Built to Figma frame `853:2059` ("DSH – Academy lesson details").
 *
 * WHAT CHANGED FROM THE PREVIOUS BUILD
 *
 * The old page was a 70/30 split — video on the left, a lesson sidebar on the
 * right — with a breadcrumb above it and Resources/Notes/Comments as three
 * tabs. The frame is none of those things: one centred 1224px column, the
 * video full width at the top, and the lesson list, the resources and the
 * notes as three separate stacked sections down the page. Tabs are only Notes
 * and Comments. So this is a rebuild, not a set of tweaks.
 *
 * MEASUREMENTS
 *
 * Every number below comes from the frame, with the node id next to it. The
 * 1224px column sits at x=348 in a 1920 frame — (1920−1224)/2 = 348 — so it is
 * a centred container, not a fixed offset.
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

function ClockIcon() {
  // 18×15 in the frame (853:1728)
  return (
    <svg width="18" height="15" viewBox="0 0 18 15" fill="none" aria-hidden>
      <circle cx="9" cy="7.5" r="6.4" stroke="currentColor" strokeWidth="1.1" />
      <path d="M9 4.2v3.5l2.3 1.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

function BigPlayButton() {
  // 60×60 (849:1178)
  return (
    <span className="flex items-center justify-center size-[60px]">
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" aria-hidden>
        <circle cx="30" cy="30" r="29" stroke="#F0F0F0" strokeOpacity="0.9" strokeWidth="1.4" />
        <path d="M24 19.5l19 10.5-19 10.5V19.5z" fill="#F0F0F0" fillOpacity="0.9" />
      </svg>
    </span>
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
}: {
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
        <p className={`${BODY_14} text-[#9D9C9C]`}>
          {remaining > 0
            ? `${remaining} lesson${remaining === 1 ? "" : "s"} left before your certificate.`
            : "You have completed every lesson. Certificates are issued to signed-in learners."}
        </p>
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

  const lessons: AcademyLesson[] = program.lessons.length > 0 ? program.lessons : [];

  const total = lessons.length;
  const current = Math.min(Math.max(lessonIndex, 0), Math.max(total - 1, 0));
  const lesson = lessons[current];
  /* A locked lesson does not play. The page still shows everything around it —
     the curriculum, the resources, the notes — so a visitor can see what they
     would be joining rather than hitting a wall. */
  const lockedNow = Boolean(lesson?.locked);

  /* Completion is held here for now. It survives a lesson change but not a
     reload — persisting it needs a per-user record, which does not exist yet. */
  const [done, setDone] = useState<Set<number>>(new Set());
  /* Which lesson's player is mounted. Tracked by index rather than a boolean
     so moving to another lesson unmounts the old player — and stops its
     download — without an effect to reset state. */
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [failedIndex, setFailedIndex] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const markDone = (i: number) => setDone((d) => new Set(d).add(i));

  const kind = kindOf(lesson);
  const playable = kind === "video" && Boolean(lesson?.videoUrl) && !lockedNow;
  const isPlaying = playable && playingIndex === current && failedIndex !== current;
  const poster =
    (lesson?.videoGuid ? videoThumbnailUrl("bunny", lesson.videoGuid) : "") || program.thumbnailUrl;
  const sections = program.sections ?? [];
  const [tab, setTab] = useState<"notes" | "comments">("notes");
  const [noteText, setNoteText] = useState("");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<{ name: string; text: string }[]>([]);

  /* One number drives the bar and the label. The frame draws a 273px fill on a
     1224px track (22%) while the label reads 35% — the two disagree in the
     design itself, so they are computed from the same value here. */
  const percent = total > 0 ? Math.round((done.size / total) * 100) : 0;

  const courseHref = href(`/course/${program.slug}`);

  return (
    <main className="relative bg-[#0D0D0D]">
      <div className="film-grain" />
      <Navbar />

      {/* The navbar is fixed, so it takes no layout space. The frame gives it
          128px and starts the content underneath — without this padding every
          section on the page sat 128px too high. */}
      <div className="relative max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0 pt-[128px]">
        {/* ── Back — Frame 93 (853:2085) ── */}
        <Link
          href={courseHref}
          className={`flex w-fit items-center gap-[7px] pt-[60px] leading-[16px] ${BTN_13} text-[#595C5C] hover:text-[#8B8F8F] transition-colors`}
        >
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden>
            <path d="M11 4H1M1 4L4 1M1 4L4 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </Link>

        {/* ── Tag · course · instructor — Frame 773 (851:1715) ──
            pt 80 to land the row at y=284; pb 30 to meet the video at y=339. */}
        <div className="flex items-center justify-between pt-[80px] pb-[30px]">
          <div className="flex gap-[14px] items-center flex-wrap">
            <span
              className="flex items-center justify-center px-[8px] py-[5px] rounded-[3px] text-[12px] leading-[15px] font-medium text-[#F0F0F0]"
              style={{ background: "rgba(50,198,204,0.7)" }}
            >
              {/* The type is stored lowercase ("course", "mentorship"); the
                  frame's chip reads "Mentorships" — a label, not a key. */}
              {program.type.charAt(0).toUpperCase() + program.type.slice(1)}
            </span>
            <span className="flex gap-[10px] items-center flex-wrap">
              <Link href={courseHref} className={`${BODY_14} text-[#32C6CC] hover:underline`}>
                {program.title}
              </Link>
              <span className="text-[12px] leading-[15px] font-medium text-[#F0F0F0]">{program.whoLeads}</span>
            </span>
          </div>
        </div>

        {/* ── Video — Frame 450 (849:1177): 1224×600, radius 6,
            border 1.5px rgba(240,240,240,0.1), image at 80%,
            drop shadow 0 6px 7px rgba(17,17,17,0.8) ── */}
        <div
          className="relative flex items-center justify-center overflow-hidden rounded-[6px] w-full"
          style={{
            /* The frame's 1224×600 is a video's shape. A survey or a reading
               on a phone would be cut off inside it, so non-video lessons
               keep the width and let the height follow the content. */
            aspectRatio: kind === "video" || lockedNow ? "1224 / 600" : undefined,
            minHeight: kind === "video" || lockedNow ? undefined : 360,
            background: "#0D0D0D",
            border: "1.5px solid rgba(240,240,240,0.1)",
            filter: "drop-shadow(0px 6px 7px rgba(17,17,17,0.8))",
          }}
        >
          {isPlaying ? (
            /* Mounted only after the click — see LessonVideo for why. */
            <LessonVideo
              key={current}
              src={lesson!.videoUrl}
              poster={poster}
              onEnded={() => markDone(current)}
              onFail={() => setFailedIndex(current)}
            />
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={kind === "video" ? poster : program.thumbnailUrl}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: kind === "video" ? 0.8 : 0.18 }}
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
                playable && failedIndex !== current ? (
                  <button
                    type="button"
                    className="relative transition-transform hover:scale-[1.04]"
                    aria-label={`Play — ${lesson?.title ?? ""}`}
                    onClick={() => setPlayingIndex(current)}
                  >
                    <BigPlayButton />
                  </button>
                ) : (
                  /* No source, or the player reported a fatal error. Say so
                     instead of offering a play button that does nothing. */
                  <p className={`relative ${BODY_14} text-[#F0F0F0] px-[24px] text-center`}>
                    {failedIndex === current
                      ? "This video could not be loaded. Please try again later."
                      : "This video is being prepared."}
                  </p>
                )
              ) : (
                <LessonPanel
                  lesson={lesson}
                  kind={kind}
                  isDone={done.has(current)}
                  answer={answer}
                  setAnswer={setAnswer}
                  remaining={lessons.filter(
                    (l, i) => !done.has(i) && !["link", "certificate"].includes(kindOf(l))
                  ).length}
                  onComplete={() => {
                    markDone(current);
                    setAnswer("");
                  }}
                />
              )}
            </>
          )}
        </div>

        {/* ── Module — Frame 775 (851:1721): pt 60 / pb 20 eyebrow, pb 80 block ── */}
        <div className="flex flex-col items-start pb-[80px]">
          <p className={`${EYEBROW} pt-[60px] pb-[20px]`}>
            {lesson?.sectionIndex !== undefined && sections[lesson.sectionIndex]
              ? sections[lesson.sectionIndex].title
              : "Module"}
          </p>
          <div className="flex flex-wrap gap-[15px] items-end pb-[20px] w-full">
            <p className="text-[26px] font-semibold leading-[26px] tracking-[1px] text-[#32C6CC]">
              {String(current + 1).padStart(2, "0")}
            </p>
            <h1 className="text-[26px] font-semibold leading-[26px] tracking-[-0.75px] text-[#F0F0F0]">
              {lesson?.title ?? program.title}
            </h1>
          </div>
          <p className={`${BODY_16} text-[#595C5C] max-w-[612px]`}>{program.description}</p>
        </div>

        {/* ── Your progress — Frame 772 (851:1706): pb 70 ── */}
        <div className="flex flex-col pb-[70px]">
          <p className={`${EYEBROW} pb-[20px]`}>Your progress</p>
          <div className="w-full h-[6px] rounded-full overflow-hidden" style={{ background: "#161616" }}>
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${percent}%`, background: "linear-gradient(to right, #32C6CC, #B23495)" }}
            />
          </div>
          <div className="flex items-center justify-between pt-[14px]">
            <span className="text-[12px] leading-[18px] text-[#595C5C]">{percent}% complete</span>
            <span className="text-[12px] leading-[18px] text-[#595C5C]">
              {done.size} of {total} lessons
            </span>
          </div>
        </div>

        {/* ── Module content — Frame 734 (849:1206) + rows (853:1921) ── */}
        <p className={`${EYEBROW} pb-[20px]`}>Module content</p>
        <div className="h-0 w-full" style={{ boxShadow: "0 -1px 0 0 rgba(240,240,240,0.1)" }} />

        {/* Every rule on this page is drawn as a shadow on a zero-height
            element, the way the frame draws it — a 1px border or a 1px block
            would add itself to the stack and push each row 1px further down
            than the frame, which is exactly what it did on the first pass.

            Row pitch is 60px in the frame: 24px of content, an 18px gap, the
            rule, then 18px to the next row. The rule is drawn as a border on a
            zero-height element so it adds nothing to that arithmetic. */}
        <div className="flex flex-col gap-[18px] pt-[18px]">
          {lessons.map((l, i) => {
            const isDone = done.has(i);
            const locked = l.locked;
            const k = kindOf(l);
            /* A section header goes above the first lesson of each section.
               Pre-047 courses have no sections and render exactly as before. */
            const si = l.sectionIndex;
            const startsSection =
              sections.length > 0 && si !== undefined && (i === 0 || lessons[i - 1].sectionIndex !== si);
            return (
              <div key={l.id ?? i} className="flex flex-col gap-[18px]">
                {startsSection && (
                  <p
                    className={`${EYEBROW} px-[24px] ${i === 0 ? "" : "pt-[30px]"}`}
                    style={{ color: "#595C5C" }}
                  >
                    {String(si + 1).padStart(2, "0")} · {sections[si]?.title}
                  </p>
                )}
                <div className="flex items-center justify-between gap-[24px] px-[24px] flex-wrap">
                  <div className="flex items-end min-w-0">
                    <span
                      className="flex items-center h-[23px] pr-[30px] text-[11px] leading-[24px] tracking-[1.76px] uppercase shrink-0"
                      style={{ color: locked ? "#363636" : "#32C6CC" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p
                      className={`${BODY_16} max-w-[653px]`}
                      style={{ color: locked ? "#363636" : "#F0F0F0" }}
                    >
                      {l.title}
                    </p>
                  </div>

                  {locked ? (
                    /* Frame 776 (851:1723). A real destination — the course
                       page is where enrolment lives — rather than a control
                       that looks live and does nothing. */
                    <Link
                      href={courseHref}
                      className={`flex gap-[10px] items-center ${BTN_13} text-[#595C5C] hover:text-[#8B8F8F] transition-colors`}
                    >
                      Unlock this lesson
                      <LockIcon />
                    </Link>
                  ) : (
                    <div className="flex gap-[40px] items-center flex-wrap">
                      {/* A running time only appears when the lesson has one;
                          a lesson that is not a video says what it is instead. */}
                      {k === "video" ? (
                        l.duration && (
                          <span className="flex gap-[10px] items-center text-[#F0F0F0]">
                            <span className={BODY_14}>{l.duration}</span>
                            <ClockIcon />
                          </span>
                        )
                      ) : (
                        <span className={`${BODY_14} text-[#595C5C]`}>{KIND_LABEL[k] ?? k}</span>
                      )}

                      <Link
                        href={href(`/course/${program.slug}/learn?lesson=${i}`)}
                        className={`flex gap-[10px] items-center ${BTN_13} transition-colors hover:text-[#8B8F8F]`}
                        style={{ color: i === current ? "#F0F0F0" : "#595C5C" }}
                      >
                        {k === "video" ? "Play lesson" : "Open"}
                        <PlaySmallIcon />
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          setDone((d) => {
                            const next = new Set(d);
                            if (next.has(i)) next.delete(i);
                            else next.add(i);
                            return next;
                          })
                        }
                        aria-pressed={isDone}
                        className={`flex gap-[10px] items-center ${BTN_13} transition-colors hover:text-[#8B8F8F]`}
                        style={{ color: isDone ? "#F0F0F0" : "#595C5C" }}
                      >
                        Mark this lesson as complete
                        <CheckCircleIcon filled={isDone} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="h-0 w-full" style={{ boxShadow: "0 -1px 0 0 rgba(240,240,240,0.1)" }} />
              </div>
            );
          })}
        </div>

        {/* ── Module Resources — Frame 796 (853:2012) ── */}
        <div className="flex flex-col pt-[18px]">
          <p className={`${EYEBROW} pb-[20px]`}>Module Resources</p>
          {program.resources.length === 0 ? (
            <p className={`${BODY_14} text-[#595C5C]`}>
              No resources have been attached to this module yet.
            </p>
          ) : (
            <div className="flex flex-col gap-[16px]">
              {program.resources.map((file) => (
                <ResourceRow key={file.id} file={file} unlockHref={courseHref} />
              ))}
            </div>
          )}
        </div>

        {/* ── Notes / Comments — Frame 795 (853:2011): pt 100, pb 30, gap 15 ── */}
        <div className="flex flex-col gap-[15px] pt-[100px] pb-[30px]">
          <div className="flex gap-[10px] items-center">
            {(["notes", "comments"] as const).map((t) => {
              const active = tab === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex items-center justify-center px-[14px] py-[12px] rounded-[3px] ${BTN_13} transition-colors`}
                  style={
                    active
                      ? { background: "rgba(50,198,204,0.7)", color: "#F0F0F0", backdropFilter: "blur(3px)" }
                      : { background: "rgba(27,27,27,0.4)", color: "#595C5C" }
                  }
                >
                  {t === "notes" ? "Notes" : "Comments"}
                </button>
              );
            })}
          </div>
          <div className="h-0 w-full" style={{ boxShadow: "0 -1px 0 0 rgba(240,240,240,0.1)" }} />
        </div>

        {/* ── The box and its button — Frame 797 (853:2029): gap 20, pb 200 ── */}
        <div className="flex flex-col gap-[20px] items-end pb-[200px]">
          {tab === "notes" ? (
            <>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write your notes for this module..."
                className={`w-full h-[138px] p-[20px] rounded-[6px] resize-none outline-none ${BTN_13} text-[#F0F0F0] placeholder:text-[#363636]`}
                style={{ background: "rgba(54,54,54,0.1)", border: "1px solid #161616" }}
              />
              <button
                type="button"
                disabled={!noteText.trim()}
                onClick={() => setNoteText("")}
                className={`flex gap-[7px] items-center justify-center w-full sm:w-[300px] p-[14px] rounded-[3px] ${BTN_13} text-[#F0F0F0] transition-opacity disabled:opacity-40`}
                style={{
                  border: "1px solid rgba(240,240,240,0.2)",
                  backgroundImage:
                    "linear-gradient(93.1087deg, rgb(50,198,204) 0.1096%, rgb(178,52,149) 100.11%)",
                }}
              >
                Publish
                <PublishIcon />
              </button>
            </>
          ) : (
            <>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment for this module..."
                className={`w-full h-[138px] p-[20px] rounded-[6px] resize-none outline-none ${BTN_13} text-[#F0F0F0] placeholder:text-[#363636]`}
                style={{ background: "rgba(54,54,54,0.1)", border: "1px solid #161616" }}
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
                className={`flex gap-[7px] items-center justify-center w-full sm:w-[300px] p-[14px] rounded-[3px] ${BTN_13} text-[#F0F0F0] transition-opacity disabled:opacity-40`}
                style={{
                  border: "1px solid rgba(240,240,240,0.2)",
                  backgroundImage:
                    "linear-gradient(93.1087deg, rgb(50,198,204) 0.1096%, rgb(178,52,149) 100.11%)",
                }}
              >
                Publish
                <PublishIcon />
              </button>

              {comments.length > 0 && (
                <div className="w-full flex flex-col gap-[16px] items-start">
                  {comments.map((c, i) => (
                    <div key={i} className="flex gap-[12px] items-start w-full">
                      <span
                        className="shrink-0 size-[32px] rounded-full flex items-center justify-center text-[12px] font-semibold"
                        style={{ background: "rgba(27,27,27,0.4)", color: "#595C5C" }}
                      >
                        {c.name[0]}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#F0F0F0]">{c.name}</p>
                        <p className={`${BODY_14} text-[#595C5C] mt-[4px]`}>{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Newsletter />
      <Footer />
    </main>
  );
}
