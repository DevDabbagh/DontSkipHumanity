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

export default function AcademyListing({ programs }: { programs: AcademyProgram[] }) {
  const sectionRef = useReveal();

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      <InternalNav section="Academy" />

      <section className="pt-14">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-16 sm:pt-20 pb-10">
          <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-4">Academy</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] tracking-tight max-w-3xl">
            Education that names power
            <span className="gradient-text"> and builds capacity.</span>
          </h1>
          <p className="text-gray-400 mt-5 max-w-2xl leading-relaxed">
            Courses, workshops, toolkits, and fellowships — all free by principle. Built for filmmakers, journalists, organisers, and anyone who believes storytelling should serve justice.
          </p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-20" ref={sectionRef}>
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
                  <img
                    src={program.thumbnailUrl}
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${typeInfo?.color} backdrop-blur-sm`}>
                      {typeInfo?.label}
                    </span>
                    {program.isFree && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-[#1ABC9C]/20 text-[#1ABC9C] backdrop-blur-sm">
                        Free
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-black/40 text-white/70 backdrop-blur-sm">
                      {program.enrolledCount} enrolled
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-gray-200 transition-colors">{program.title}</h3>
                <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{program.description}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                  <span>{program.duration}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                  <span>Led by {program.whoLeads}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <Footer />
    </main>
  );
}
