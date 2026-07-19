"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import InternalNav from "@/components/InternalNav";
import Footer from "@/components/Footer";
import type { AcademyProgram } from "@/lib/types";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  course: { label: "Course", color: "bg-[#9B59B6]/20 text-[#c084fc]" },
  workshop: { label: "Workshop", color: "bg-[#1ABC9C]/20 text-[#1ABC9C]" },
  toolkit: { label: "Toolkit", color: "bg-emerald-500/20 text-emerald-300" },
  resource: { label: "Resource", color: "bg-amber-500/20 text-amber-300" },
  mentorship: { label: "Mentorship", color: "bg-indigo-500/20 text-indigo-300" },
};

const FORMAT_LABELS: Record<string, string> = {
  online: "Online",
  in_person: "In Person",
  hybrid: "Hybrid",
  self_paced: "Self-Paced",
  downloadable: "Downloadable",
};

export default function CourseContent({
  program,
  relatedPrograms,
}: {
  program: AcademyProgram;
  relatedPrograms: AcademyProgram[];
}) {
  const sectionRef = useReveal();
  const typeInfo = TYPE_LABELS[program.type] ?? { label: program.type, color: "bg-white/10 text-gray-300" };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      <InternalNav section={program.title} backLabel="Academy" backHref="/academy" />

      {/* Hero */}
      <section className="relative pt-14">
        <div className="relative h-[40vh] sm:h-[50vh] overflow-hidden">
          <img
            src={program.thumbnailUrl}
            alt={program.title}
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/70 to-[#0D0D0D]/30" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16">
            <div className="max-w-[1400px] mx-auto">
              <div className="flex items-center gap-3 mb-5">
                <span className={`text-xs px-3 py-1.5 rounded-full ${typeInfo.color} backdrop-blur-sm`}>{typeInfo.label}</span>
                <span className="text-xs text-gray-300/80 backdrop-blur-sm bg-white/5 px-3 py-1.5 rounded-full">{FORMAT_LABELS[program.format] ?? program.format}</span>
                {program.isFree && (
                  <span className="text-xs px-3 py-1.5 rounded-full bg-[#1ABC9C]/20 text-[#1ABC9C] backdrop-blur-sm">Free</span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] max-w-3xl tracking-tight">{program.title}</h1>
              <p className="text-lg text-gray-300 mt-5 max-w-2xl leading-relaxed">{program.description}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8" ref={sectionRef}>
        {/* Quick info bar */}
        <div className="reveal py-10 border-b border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[
            { label: "Led by", value: program.whoLeads },
            { label: "Duration", value: program.duration },
            { label: "Dates", value: program.dates },
            { label: "Enrolled", value: `${program.enrolledCount} participants` },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1.5">{item.label}</p>
              <p className="text-sm text-white font-medium">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Main content: 2-column */}
        <div className="py-14 sm:py-20 grid lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Left: details */}
          <div className="lg:col-span-2 space-y-14">
            <div className="reveal">
              <h2 className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-5">Who it&apos;s for</h2>
              <p className="text-gray-300 leading-[1.8] text-[15px]">{program.whoItsFor}</p>
            </div>

            <div className="reveal">
              <h2 className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-6">What you&apos;ll learn</h2>
              <div className="space-y-5">
                {program.objectives.map((obj, i) => (
                  <div key={i} className={`reveal stagger-${Math.min(i + 1, 5)} flex gap-5 items-start`}>
                    <span className="text-xs font-mono text-[#1ABC9C] mt-1 shrink-0 w-6 h-6 rounded-full bg-[#1ABC9C]/10 flex items-center justify-center">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-gray-300 text-[15px] leading-relaxed">{obj}</p>
                  </div>
                ))}
              </div>
            </div>

            {program.scholarshipNote && (
              <div className="reveal rounded-2xl bg-gradient-to-br from-[#1ABC9C]/5 to-[#9B59B6]/5 border border-[#1ABC9C]/10 p-7">
                <p className="text-sm text-[#1ABC9C] font-medium mb-2">Free by principle</p>
                <p className="text-sm text-gray-400 leading-relaxed">{program.scholarshipNote}</p>
              </div>
            )}

            {program.resources.length > 0 && (
              <div className="reveal">
                <h2 className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-6">Resources</h2>
                <div className="space-y-3">
                  {program.resources.map((res) => (
                    <a
                      key={res.id}
                      href={res.url}
                      className="flex items-center gap-4 p-5 rounded-xl bg-[#1A1A1A]/80 border border-white/[0.06] hover:border-white/10 transition-all duration-300 group"
                    >
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-gray-400 uppercase tracking-wider font-medium">
                        {res.type}
                      </span>
                      <span className="text-sm text-white group-hover:text-gray-200 flex-1">{res.title}</span>
                      <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: sticky CTA sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="rounded-2xl bg-[#1A1A1A]/80 border border-white/[0.06] p-7 space-y-6">
                <div>
                  <p className="text-3xl font-bold text-white">{program.isFree ? "Free" : `€${program.price}`}</p>
                  <p className="text-xs text-gray-500 mt-1.5">{program.isFree ? "No cost, no strings." : "One-time payment"}</p>
                </div>

                <div className="gradient-divider" />

                <div className="space-y-4">
                  {[
                    { label: "Format", value: FORMAT_LABELS[program.format] },
                    { label: "Duration", value: program.duration },
                    { label: "Completion rate", value: `${program.completionRate}%` },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{item.label}</span>
                      <span className="text-white font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full py-3.5 rounded-xl gradient-fill-btn text-sm font-medium shadow-lg shadow-purple-500/10">
                  {program.type === "toolkit" || program.type === "resource" ? "Download" : "Enroll Now"}
                </button>

                <p className="text-xs text-gray-500 text-center leading-relaxed">{program.howToJoin}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related programs */}
        {relatedPrograms.length > 0 && (
          <div className="reveal py-16 sm:py-20 border-t border-white/5">
            <h2 className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-10">More from the Academy</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedPrograms.map((rp) => {
                const rpType = TYPE_LABELS[rp.type];
                return (
                  <Link key={rp.slug} href={`/course/${rp.slug}`} className="reveal-scale group cursor-pointer">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                      <img src={rp.thumbnailUrl} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full ${rpType?.color}`}>{rpType?.label}</span>
                      {rp.isFree && <span className="text-xs text-[#1ABC9C]">Free</span>}
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-gray-200 transition-colors text-lg">{rp.title}</h3>
                    <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{rp.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
