"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";

const EVENTS = [
  {
    day: "28",
    month: "Aug",
    type: "Screening",
    typeColor: "text-[#B23495]",
    title: "Free Fish — Community Screening & Q&A",
    venue: "Instituto Cervantes, Lisbon",
    slug: "free-fish-community-screening",
    badge: true,
  },
  {
    day: "08",
    month: "Sep",
    type: "Workshop",
    typeColor: "text-[#32C6CC]",
    title: "Ethical Storytelling for Journalists",
    venue: "Online — Zoom",
    slug: "ethical-storytelling-workshop",
    badge: true,
  },
  {
    day: "08",
    month: "Sep",
    type: "Screening",
    typeColor: "text-[#B23495]",
    title: "Palestine Film Night — Porto",
    venue: "Rivoli Teatro Municipal, Porto",
    slug: "palestine-film-night-porto",
    badge: false,
  },
  {
    day: "08",
    month: "Sep",
    type: "Festival",
    typeColor: "text-[#8665A7]",
    title: "IDFA 2026 — What We Carried official selection",
    venue: "International Documentary Film Festival Amsterdam",
    slug: "idfa-2026-what-we-carried",
    badge: false,
  },
];

export default function Agenda() {
  const sectionRef = useReveal();

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-5 sm:px-8 max-w-[1400px] mx-auto" ref={sectionRef}>
      {/* Header */}
      <div className="reveal mb-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold leading-tight max-w-2xl text-dsh-text-primary">
          DSH makes documentary and fiction
          <br className="hidden md:block" />
          — from development and production to festivals.
        </h2>
      </div>

      {/* Events list */}
      <div className="space-y-0">
        {EVENTS.map((event, i) => (
          <Link
            key={`${event.slug}-${i}`}
            href={`/agenda/${event.slug}`}
            className={`reveal stagger-${Math.min(i + 1, 5)} py-6 sm:py-8 border-t border-white/5 block group hover:bg-white/[0.02] transition-colors -mx-5 sm:-mx-8 px-5 sm:px-8`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 md:gap-10">
              <div className="flex items-baseline gap-4 sm:gap-6">
                <div className="shrink-0 w-auto sm:w-16 sm:text-center">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-light text-dsh-text-primary">
                    {event.day}
                  </span>
                  <span className="text-xs sm:text-sm text-dsh-desc ml-1">{event.month}</span>
                </div>
                <div className="shrink-0 sm:w-24">
                  <span className={`text-sm ${event.typeColor}`}>{event.type}</span>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-sm sm:text-base text-dsh-text-primary group-hover:text-white transition-colors">{event.title}</p>
                <p className="text-xs sm:text-sm text-dsh-desc mt-1">{event.venue}</p>
              </div>

              <div className="shrink-0 self-start sm:self-center">
                <span className="text-xs border border-dsh-text-primary/20 rounded-[3px] px-4 py-1.5 bg-dsh-btn-bg/20 text-dsh-text-primary/40 group-hover:text-dsh-text-primary/60 group-hover:border-dsh-text-primary/30 transition-colors inline-flex items-center gap-1.5">
                  details
                  <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
