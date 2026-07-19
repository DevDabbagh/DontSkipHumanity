"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";

const EVENTS = [
  {
    day: "20",
    month: "Jul",
    type: "Screening",
    typeColor: "text-[#9B59B6]",
    title: "Free Fish — Community Screening & Q&A",
    venue: "Instituto Cervantes, Lisbon",
    slug: "free-fish-community-screening",
  },
  {
    day: "25",
    month: "Jul",
    type: "Workshop",
    typeColor: "text-[#1ABC9C]",
    title: "Ethical Storytelling for Journalists",
    venue: "Online — Zoom",
    slug: "ethical-storytelling-workshop",
  },
  {
    day: "05",
    month: "Aug",
    type: "Screening",
    typeColor: "text-[#E74C3C]",
    title: "Palestine Film Night — Porto",
    venue: "Rivoli Teatro Municipal, Porto",
    slug: "palestine-film-night-porto",
  },
];

export default function Agenda() {
  const sectionRef = useReveal();

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-5 sm:px-8 max-w-[1400px] mx-auto" ref={sectionRef}>
      {/* Header */}
      <div className="reveal flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-12">
        <div>
          <p className="text-xs tracking-[0.25em] text-gray-500 uppercase mb-4">
            Agenda
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight max-w-2xl">
            Screenings, workshops, and public
            <br className="hidden md:block" />
            programming — where the work meets the world.
          </h2>
        </div>
        <Link
          href="/agenda"
          className="text-sm border border-white/15 rounded-full px-5 py-2 text-white hover:bg-white/5 transition-colors self-start"
        >
          view all events ↗
        </Link>
      </div>

      {/* Events list */}
      <div className="space-y-0">
        {EVENTS.map((event, i) => (
          <Link
            key={event.slug}
            href={`/agenda/${event.slug}`}
            className={`reveal stagger-${Math.min(i + 1, 5)} py-6 sm:py-8 border-t border-white/5 block group hover:bg-white/[0.02] transition-colors -mx-5 sm:-mx-8 px-5 sm:px-8`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 md:gap-10">
              <div className="flex items-baseline gap-4 sm:gap-6">
                <div className="shrink-0 w-auto sm:w-16 sm:text-center">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-light text-white">
                    {event.day}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 ml-1">{event.month}</span>
                </div>
                <div className="shrink-0 sm:w-24">
                  <span className={`text-sm ${event.typeColor}`}>{event.type}</span>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-sm sm:text-base text-white group-hover:text-gray-200 transition-colors">{event.title}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{event.venue}</p>
              </div>

              <div className="shrink-0 self-start sm:self-center">
                <span className="text-xs border border-white/15 rounded-full px-4 py-1.5 text-gray-400 group-hover:text-white group-hover:border-white/30 transition-colors inline-flex items-center gap-1.5">
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
