"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { slugifyName } from "@/lib/slug";
import type { AcademyProgram } from "@/lib/types";

type PlayerTab = "resources" | "notes" | "comments";

const RESOURCE_TYPE_LABEL: Record<string, string> = {
  pdf: "PDF",
  link: "LINK",
  toolkit: "TOOLKIT",
};

export default function CoursePlayer({ program, lessonIndex }: { program: AcademyProgram; lessonIndex: number }) {
  const lessons =
    program.objectives.length > 0
      ? program.objectives
      : ["Course overview", "Core practice", "Applying what you've learned"];

  const total = lessons.length;
  const current = Math.min(Math.max(lessonIndex, 0), total - 1);
  const doneCount = current;
  const percent = total > 1 ? Math.round((doneCount / (total - 1)) * 100) : 100;

  const [tab, setTab] = useState<PlayerTab>("resources");
  const [playing, setPlaying] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<{ name: string; text: string }[]>([]);

  const instructorHref = `/academy/instructor/${slugifyName(program.whoLeads)}`;

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="film-grain" />
      <Navbar />

      {/* Breadcrumb */}
      <div
        className="flex items-center gap-2 px-5 sm:px-8 flex-wrap"
        style={{ paddingTop: 88, paddingBottom: 16, background: "#0D0D0D", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <Link href="/academy" className="text-[11px] uppercase tracking-[0.1em] text-[#555] hover:text-[#999] transition-colors">
          Academy
        </Link>
        <span className="text-[#2A2A2A]">/</span>
        <Link
          href={`/course/${program.slug}`}
          className="text-[11px] uppercase tracking-[0.1em] text-[#555] hover:text-[#999] transition-colors"
        >
          {program.title}
        </Link>
        <span className="text-[#2A2A2A]">/</span>
        <span className="text-[11px] uppercase tracking-[0.1em] text-[#888]">
          Lesson {current + 1}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left — video + tabs */}
        <div className="lg:w-[70%] p-5 sm:p-8 pb-16">
          <p className="text-[12px] mb-3 text-[#666]">
            Lesson {current + 1} of {total}
          </p>

          <div className="relative overflow-hidden bg-[#161616]" style={{ aspectRatio: "16/9", borderRadius: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={program.thumbnailUrl}
              alt={lessons[current]}
              className="w-full h-full object-cover"
              style={{ opacity: 0.35 }}
            />
            <div className="absolute inset-0 bg-black opacity-30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => setPlaying((p) => !p)}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}
              >
                {playing ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-10"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)" }}
            >
              <div className="w-full rounded-full mb-3 cursor-pointer" style={{ height: 3, background: "#2A2A2A" }}>
                <div className="h-full rounded-full" style={{ width: "38%", background: "#1ABC9C" }} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setPlaying((p) => !p)} className="text-white">
                    {playing ? "❙❙" : "▶"}
                  </button>
                  <span className="text-[12px] text-white">{program.duration}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <h2 className="text-[22px] font-semibold text-white leading-snug">{lessons[current]}</h2>
            <Link href={instructorHref} className="text-[13px] mt-1 inline-block text-[#888] hover:text-[#1ABC9C] transition-colors">
              {program.whoLeads}
            </Link>
            <p className="text-[14px] mt-3 leading-relaxed text-[#999]" style={{ maxWidth: 620 }}>
              {program.description}
            </p>
          </div>

          <div className="flex gap-6 mt-6 mb-5" style={{ borderBottom: "1px solid #2A2A2A" }}>
            {(["resources", "notes", "comments"] as PlayerTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="pb-3 text-[13px] font-medium relative transition-colors"
                style={{ color: tab === t ? "white" : "#666" }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {tab === t && <div className="absolute bottom-0 left-0 right-0" style={{ height: 2, background: "#1ABC9C" }} />}
              </button>
            ))}
          </div>

          {tab === "resources" && (
            <div className="space-y-2">
              {program.resources.length === 0 && (
                <p className="text-[14px] text-[#666]">No downloadable resources for this course yet.</p>
              )}
              {program.resources.map((file) => (
                <a
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 rounded-[8px] cursor-pointer transition-colors"
                  style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "rgba(26,188,156,0.1)", color: "#1ABC9C" }}>
                      {RESOURCE_TYPE_LABEL[file.type] ?? file.type.toUpperCase()}
                    </span>
                    <span className="text-[14px] text-white">{file.title}</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth={2}>
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              ))}
            </div>
          )}

          {tab === "notes" && (
            <div>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write your notes for this lesson..."
                className="w-full text-[14px] leading-relaxed px-4 py-3 resize-none outline-none"
                style={{ background: "#161616", border: "1px solid #2A2A2A", borderRadius: 12, color: "#CCC", minHeight: 200 }}
              />
              <button className="mt-3 px-4 py-2 rounded-[8px] text-[13px] text-white" style={{ border: "1px solid #2A2A2A" }}>
                Save notes
              </button>
            </div>
          )}

          {tab === "comments" && (
            <div>
              <div className="flex gap-3 mb-7">
                <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: "#2A2A2A" }} />
                <div className="flex-1 flex items-center gap-3">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 text-[14px] px-3 py-2 rounded-[8px] outline-none"
                    style={{ background: "#161616", border: "1px solid #2A2A2A", color: "#CCC" }}
                  />
                  <button
                    className="text-[13px] font-medium flex-shrink-0"
                    style={{ color: "#1ABC9C" }}
                    onClick={() => {
                      if (!commentText.trim()) return;
                      setComments((c) => [{ name: "You", text: commentText.trim() }, ...c]);
                      setCommentText("");
                    }}
                  >
                    Post
                  </button>
                </div>
              </div>
              {comments.length === 0 ? (
                <p className="text-[14px] text-[#666]">Be the first to comment on this lesson.</p>
              ) : (
                <div className="space-y-6">
                  {comments.map((c, i) => (
                    <div key={i} className="flex gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] font-semibold"
                        style={{ background: "#2A2A2A", color: "#888" }}
                      >
                        {c.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[13px] font-medium text-white">{c.name}</span>
                        <p className="text-[14px] leading-relaxed mt-1" style={{ color: "#CCC" }}>
                          {c.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — module sidebar */}
        <div className="lg:w-[30%] p-5" style={{ background: "#161616", borderLeft: "1px solid #2A2A2A" }}>
          <div className="pb-5 mb-1" style={{ borderBottom: "1px solid #2A2A2A" }}>
            <p className="text-[14px] font-semibold text-white mb-3">Your Progress</p>
            <div className="w-full rounded-full" style={{ height: 6, background: "#2A2A2A" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, background: "#1ABC9C" }} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[12px] text-[#888]">{percent}% complete</span>
              <span className="text-[12px] text-[#666]">
                {doneCount} of {total} lessons
              </span>
            </div>
          </div>

          <div style={{ borderBottom: "1px solid #2A2A2A" }}>
            <div className="px-0 py-4">
              <p className="text-[11px] uppercase mb-0.5 text-[#1ABC9C]" style={{ letterSpacing: "0.12em" }}>
                Course Content
              </p>
            </div>
            {lessons.map((title, i) => {
              const status = i < current ? "done" : i === current ? "current" : "upcoming";
              return (
                <Link
                  key={i}
                  href={`/course/${program.slug}/learn?lesson=${i}`}
                  className="flex items-center px-0 py-3 cursor-pointer hover:bg-black/10 transition-colors"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                    background: status === "current" ? "rgba(26,188,156,0.04)" : "transparent",
                    borderLeft: status === "current" ? "2px solid #1ABC9C" : "2px solid transparent",
                    paddingLeft: status === "current" ? 10 : 12,
                  }}
                >
                  <div className="flex-shrink-0 mr-3 w-4 flex justify-center">
                    {status === "done" && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1ABC9C" strokeWidth={2}>
                        <circle cx="12" cy="12" r="9" /><path d="M8.5 12l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {status === "current" && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#1ABC9C"><path d="M8 5v14l11-7z" /></svg>
                    )}
                    {status === "upcoming" && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth={2}><circle cx="12" cy="12" r="9" /></svg>
                    )}
                  </div>
                  <span
                    className="text-[13px] flex-1 leading-snug"
                    style={{ color: status === "done" ? "#888" : status === "current" ? "white" : "#CCC" }}
                  >
                    {title}
                  </span>
                </Link>
              );
            })}
          </div>

          {current === total - 1 ? (
            <Link
              href={`/course/${program.slug}/learn/complete?lesson=${current}`}
              className="mt-6 block text-center py-3 rounded-[8px] text-[13px] font-medium text-white gradient-fill-btn"
            >
              Finish course
            </Link>
          ) : (
            <Link
              href={`/course/${program.slug}/learn/complete?lesson=${current}`}
              className="mt-6 block text-center py-3 rounded-[8px] text-[13px] font-medium text-white gradient-fill-btn"
            >
              Mark lesson complete
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
