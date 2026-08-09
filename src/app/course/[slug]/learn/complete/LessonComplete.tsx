"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { AcademyProgram } from "@/lib/types";

type CompleteView = "stateA" | "stateB";

export default function LessonComplete({ program, lessonIndex }: { program: AcademyProgram; lessonIndex: number }) {
  const lessons =
    program.objectives.length > 0
      ? program.objectives
      : ["Course overview", "Core practice", "Applying what you've learned"];

  const total = lessons.length;
  const current = Math.min(Math.max(lessonIndex, 0), total - 1);
  const isLast = current === total - 1;
  const nextHref = isLast ? `/course/${program.slug}` : `/course/${program.slug}/learn?lesson=${current + 1}`;

  const [view, setView] = useState<CompleteView>("stateA");

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="film-grain" />
      <Navbar />

      <div
        className="fixed z-40 flex overflow-hidden"
        style={{ top: 76, right: 20, border: "1px solid #2A2A2A", borderRadius: 8 }}
      >
        {([
          { key: "stateA", label: "Lesson Complete" },
          { key: "stateB", label: "Module Overview" },
        ] as { key: CompleteView; label: string }[]).map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className="text-[11px] px-3 py-1.5 transition-colors"
            style={{ background: view === v.key ? "#1A1A1A" : "transparent", color: view === v.key ? "#CCC" : "#555" }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "stateA" && (
        <div className="flex flex-col items-center justify-center text-center px-6" style={{ minHeight: "100vh" }}>
          <div
            className="flex items-center justify-center mb-7"
            style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid #1ABC9C" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1ABC9C" strokeWidth={2.5}>
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-semibold text-white mb-2" style={{ fontSize: 24 }}>
            Lesson Complete
          </h2>
          <p className="text-[14px] mb-8 text-[#888]">{lessons[current]}</p>
          <div className="flex gap-3">
            <Link
              href={nextHref}
              className="flex items-center gap-2 px-6 py-3 rounded-[12px] font-semibold text-[14px] bg-white transition-opacity hover:opacity-90"
              style={{ color: "#0D0D0D" }}
            >
              {isLast ? "Back to course" : "Next Lesson"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth={2}>
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <button
              onClick={() => setView("stateB")}
              className="px-6 py-3 rounded-[12px] text-[14px] font-medium transition-colors hover:bg-white/[0.06]"
              style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#CCCCCC" }}
            >
              Back to Course
            </button>
          </div>
        </div>
      )}

      {view === "stateB" && (
        <div className="max-w-2xl mx-auto px-8 pb-20" style={{ paddingTop: 148 }}>
          <p className="text-[12px] uppercase font-medium mb-3" style={{ color: "#1ABC9C", letterSpacing: "0.16em" }}>
            Course Content
          </p>
          <h1 className="font-bold text-white mb-3" style={{ fontSize: 32 }}>
            {program.title}
          </h1>
          <p className="text-[15px] leading-relaxed mb-3 text-[#888]">{program.description}</p>
          <p className="text-[13px] mb-5 text-[#666]">
            {current + 1} of {total} lessons complete
          </p>
          <div className="w-full rounded-full mb-9" style={{ height: 6, background: "#2A2A2A" }}>
            <div className="h-full rounded-full" style={{ width: `${Math.round(((current + 1) / total) * 100)}%`, background: "#1ABC9C" }} />
          </div>
          <div className="space-y-3 mb-8">
            {lessons.map((title, i) => {
              const status = i < current ? "done" : i === current ? "current" : "upcoming";
              return (
                <div
                  key={i}
                  className="flex items-center px-4 py-4 rounded-[12px]"
                  style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <div className="flex-shrink-0 mr-4">
                    {status === "done" && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1ABC9C" strokeWidth={2}>
                        <circle cx="12" cy="12" r="9" /><path d="M8.5 12l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {status === "current" && <svg width="16" height="16" viewBox="0 0 24 24" fill="#1ABC9C"><path d="M8 5v14l11-7z" /></svg>}
                    {status === "upcoming" && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth={2}><circle cx="12" cy="12" r="9" /></svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium" style={{ color: status === "done" ? "#888" : "white" }}>
                      {title}
                    </p>
                  </div>
                  {status === "current" && (
                    <Link href={`/course/${program.slug}/learn?lesson=${current}`} className="text-[13px] font-medium" style={{ color: "#1ABC9C" }}>
                      Continue
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
          <Link
            href={nextHref}
            className="block text-center w-full py-3.5 rounded-xl gradient-fill-btn text-sm font-medium"
          >
            {isLast ? "Back to Course" : "Continue Module"}
          </Link>
        </div>
      )}
    </div>
  );
}
