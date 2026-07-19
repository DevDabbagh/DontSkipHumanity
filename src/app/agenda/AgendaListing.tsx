"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import InternalNav from "@/components/InternalNav";
import Footer from "@/components/Footer";
import type { DSHEvent } from "@/lib/types";

const TAG_COLORS: Record<string, string> = {
  screening: "bg-[#9B59B6]/20 text-[#c084fc]",
  workshop: "bg-[#1ABC9C]/20 text-[#1ABC9C]",
  talk: "bg-emerald-500/20 text-emerald-300",
  festival: "bg-amber-500/20 text-amber-300",
  campaign: "bg-red-500/20 text-red-300",
  community: "bg-indigo-500/20 text-indigo-300",
  premiere: "bg-purple-500/20 text-purple-300",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AgendaListing({ events }: { events: DSHEvent[] }) {
  const sectionRef = useReveal();
  const upcoming = events.filter((e) => e.status === "upcoming");
  const past = events.filter((e) => e.status === "past");

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      <InternalNav section="Agenda" />

      <section className="pt-14">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-16 sm:pt-20 pb-10">
          <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-4">Agenda</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] tracking-tight max-w-3xl">
            Where the work
            <span className="gradient-text"> meets the world.</span>
          </h1>
          <p className="text-gray-400 mt-5 max-w-2xl leading-relaxed">
            Screenings, workshops, talks, and public programming. Every event is a space for encounter — between the work and the people it exists for.
          </p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-20" ref={sectionRef}>
        {/* Upcoming events */}
        {upcoming.length > 0 && (
          <div className="mb-16">
            <h2 className="reveal text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-8">Upcoming</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {upcoming.map((event, i) => (
                <Link
                  key={event.slug}
                  href={`/agenda/${event.slug}`}
                  className={`reveal-scale stagger-${Math.min(i + 1, 5)} group`}
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                    <img
                      src={event.mainImage}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${TAG_COLORS[event.tag] ?? "bg-white/10 text-gray-300"} capitalize backdrop-blur-sm`}>
                        {event.tag}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                        <p className="text-lg font-bold text-white leading-none">
                          {new Date(event.startDate).getDate()}
                        </p>
                        <p className="text-[10px] text-gray-300 uppercase tracking-wider mt-0.5">
                          {new Date(event.startDate).toLocaleDateString("en-GB", { month: "short" })}
                        </p>
                      </div>
                    </div>
                    {event.ticketType === "free" && (
                      <div className="absolute top-3 right-3">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-[#1ABC9C]/20 text-[#1ABC9C] backdrop-blur-sm">
                          Free
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(event.startDate)}</p>
                  <h3 className="text-lg font-semibold text-white mt-1.5 group-hover:text-gray-200 transition-colors">{event.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{event.address}</p>
                  {event.capacity && (
                    <div className="mt-3">
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden w-32">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#9B59B6] to-[#1ABC9C]"
                          style={{ width: `${Math.min(Math.round((event.rsvpCount / event.capacity) * 100), 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-600 mt-1">{event.rsvpCount}/{event.capacity} registered</p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Past events */}
        {past.length > 0 && (
          <div>
            <h2 className="reveal text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-8">Past Events</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {past.map((event) => (
                <Link
                  key={event.slug}
                  href={`/agenda/${event.slug}`}
                  className="reveal-scale group opacity-60 hover:opacity-80 transition-opacity"
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 grayscale">
                    <img
                      src={event.mainImage}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(event.startDate)}</p>
                  <h3 className="text-lg font-semibold text-white mt-1.5">{event.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{event.address}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
