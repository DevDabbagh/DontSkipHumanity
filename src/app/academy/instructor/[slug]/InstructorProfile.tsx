"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useReveal } from "@/hooks/useReveal";
import type { AcademyProgram } from "@/lib/types";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  course: { label: "Course", color: "bg-[#9B59B6]/20 text-[#c084fc]" },
  workshop: { label: "Workshop", color: "bg-[#1ABC9C]/20 text-[#1ABC9C]" },
  toolkit: { label: "Toolkit", color: "bg-emerald-500/20 text-emerald-300" },
  resource: { label: "Resource", color: "bg-amber-500/20 text-amber-300" },
  mentorship: { label: "Mentorship", color: "bg-indigo-500/20 text-indigo-300" },
};

export default function InstructorProfile({ name, programs }: { name: string; programs: AcademyProgram[] }) {
  const sectionRef = useReveal();
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const totalEnrolled = programs.reduce((sum, p) => sum + p.enrolledCount, 0);

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="film-grain" />
      <Navbar />

      {/* Hero */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8" style={{ paddingTop: 120, paddingBottom: 48 }}>
        <div className="grid sm:grid-cols-[auto_1fr] gap-8 sm:gap-12 items-center">
          <div className="flex justify-center sm:justify-start">
            <div
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{
                width: 160,
                height: 160,
                background: "linear-gradient(135deg, #9B59B6, #1ABC9C)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
              }}
            >
              <span className="text-white font-bold" style={{ fontSize: 48 }}>
                {initials}
              </span>
            </div>
          </div>
          <div>
            <p
              className="text-[10px] uppercase mb-3"
              style={{ color: "rgba(54,54,54,0.8)", letterSpacing: "0.3em", fontWeight: 500 }}
            >
              Instructor
            </p>
            <h1 style={{ fontSize: 36, fontWeight: 600, color: "#FFFFFF", lineHeight: 1.15, marginBottom: 8 }}>{name}</h1>
            <p style={{ fontSize: 15, color: "#999999", marginBottom: 20 }}>DSH Academy Instructor</p>
            <div className="flex flex-wrap gap-6" style={{ fontSize: 14 }}>
              <span>
                <span style={{ fontWeight: 600, color: "#F0F0F0" }}>{programs.length}</span>
                <span style={{ color: "#595C5C" }}> program{programs.length !== 1 ? "s" : ""}</span>
              </span>
              <span style={{ color: "#363636" }}>·</span>
              <span>
                <span style={{ fontWeight: 600, color: "#F0F0F0" }}>{totalEnrolled}</span>
                <span style={{ color: "#595C5C" }}> total enrolled</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
        <div style={{ height: 1, background: "#161616" }} />
      </div>

      {/* Programs */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-16" ref={sectionRef}>
        <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-8">
          {programs.length} program{programs.length !== 1 ? "s" : ""} on the Academy
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {programs.map((program, i) => {
            const typeInfo = TYPE_LABELS[program.type];
            return (
              <Link
                key={program.slug}
                href={`/course/${program.slug}`}
                className={`reveal-scale stagger-${Math.min(i + 1, 5)} group`}
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={program.thumbnailUrl}
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${typeInfo?.color} backdrop-blur-sm`}>{typeInfo?.label}</span>
                    {program.isFree && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-[#1ABC9C]/20 text-[#1ABC9C] backdrop-blur-sm">Free</span>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-gray-200 transition-colors">{program.title}</h3>
                <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{program.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <Footer />
    </main>
  );
}
