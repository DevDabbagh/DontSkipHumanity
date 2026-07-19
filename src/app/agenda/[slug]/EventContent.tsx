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

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  upcoming: { label: "Upcoming", color: "bg-[#1ABC9C]/20 text-[#1ABC9C]" },
  past: { label: "Past", color: "bg-white/5 text-gray-400" },
  cancelled: { label: "Cancelled", color: "bg-red-500/20 text-red-300" },
  sold_out: { label: "Sold Out", color: "bg-amber-500/20 text-amber-300" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventContent({
  event,
  relatedEvents,
}: {
  event: DSHEvent;
  relatedEvents: DSHEvent[];
}) {
  const sectionRef = useReveal();
  const tagColor = TAG_COLORS[event.tag] ?? "bg-white/10 text-gray-300";
  const statusInfo = STATUS_STYLES[event.status] ?? STATUS_STYLES.upcoming;
  const capacityPercent = event.capacity ? Math.round((event.rsvpCount / event.capacity) * 100) : null;

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      <InternalNav section={event.title} backLabel="Agenda" backHref="/agenda" />

      {/* Hero */}
      <section className="relative pt-14">
        <div className="relative h-[40vh] sm:h-[50vh] overflow-hidden">
          <img src={event.mainImage} alt={event.title} className="absolute inset-0 w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16">
            <div className="max-w-[1400px] mx-auto">
              <div className="flex items-center gap-3 mb-5">
                <span className={`text-xs px-3 py-1.5 rounded-full ${tagColor} capitalize backdrop-blur-sm`}>{event.tag}</span>
                <span className={`text-xs px-3 py-1.5 rounded-full ${statusInfo.color} backdrop-blur-sm`}>{statusInfo.label}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] max-w-3xl tracking-tight">{event.title}</h1>
              <p className="text-lg text-gray-300 mt-4 max-w-2xl">{event.excerpt}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8" ref={sectionRef}>
        <div className="py-14 sm:py-20 grid lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Left: description */}
          <div className="lg:col-span-2 space-y-12">
            {/* Date/time/location bar */}
            <div className="reveal grid sm:grid-cols-3 gap-6 p-7 rounded-2xl bg-[#1A1A1A]/80 border border-white/[0.06]">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1.5">Date</p>
                <p className="text-sm text-white font-medium">{formatDate(event.startDate)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1.5">Time</p>
                <p className="text-sm text-white font-medium">{formatTime(event.startDate)} — {formatTime(event.endDate)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1.5">Location</p>
                <p className="text-sm text-white font-medium">{event.address}</p>
              </div>
            </div>

            {/* Description */}
            <div className="reveal">
              <h2 className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-5">About this event</h2>
              <p className="text-gray-300 leading-[1.8] text-[15px] whitespace-pre-line">{event.description}</p>
            </div>

            {/* Partners */}
            {event.partners.length > 0 && (
              <div className="reveal">
                <h2 className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-5">Partners</h2>
                <div className="flex flex-wrap gap-3">
                  {event.partners.map((partner) => (
                    <div key={partner.id} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1A1A1A]/80 border border-white/[0.06] hover:border-white/10 transition-colors">
                      <span className="text-sm text-white font-medium">{partner.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: sticky ticket CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="rounded-2xl bg-[#1A1A1A]/80 border border-white/[0.06] p-7 space-y-6">
                <div>
                  <p className="text-3xl font-bold text-white">
                    {event.ticketType === "free" ? "Free" : `€${event.ticketPrice}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1.5">
                    {event.ticketType === "free" ? "No registration fee" : "Per ticket"}
                  </p>
                </div>

                <div className="gradient-divider" />

                {/* Capacity */}
                {event.capacity && (
                  <div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-gray-500">{event.rsvpCount} registered</span>
                      <span className="text-gray-500">{event.capacity} spots</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#9B59B6] to-[#1ABC9C] transition-all duration-700"
                        style={{ width: `${Math.min(capacityPercent!, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {event.capacity - event.rsvpCount > 0
                        ? `${event.capacity - event.rsvpCount} spots remaining`
                        : "No spots remaining"}
                    </p>
                  </div>
                )}

                {/* CTA */}
                {event.status === "upcoming" ? (
                  <a
                    href={event.ticketUrl}
                    className="block w-full py-3.5 rounded-xl gradient-fill-btn text-sm font-medium text-center shadow-lg shadow-purple-500/10"
                  >
                    {event.ticketType === "free" ? "RSVP — It's Free" : "Get Tickets"}
                  </a>
                ) : event.status === "sold_out" ? (
                  <button disabled className="w-full py-3.5 rounded-xl bg-white/5 text-sm font-medium text-gray-500 cursor-not-allowed">
                    Sold Out
                  </button>
                ) : (
                  <button disabled className="w-full py-3.5 rounded-xl bg-white/5 text-sm font-medium text-gray-500 cursor-not-allowed">
                    Event Passed
                  </button>
                )}

                {/* Share */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <span className="text-xs text-gray-500">Share</span>
                  <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xs">𝕏</button>
                  <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xs">in</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related events */}
        {relatedEvents.length > 0 && (
          <div className="reveal py-16 sm:py-20 border-t border-white/5">
            <h2 className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-10">More events</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedEvents.map((re) => (
                <Link key={re.slug} href={`/agenda/${re.slug}`} className="reveal-scale group">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                    <img src={re.mainImage} alt={re.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-3 left-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${TAG_COLORS[re.tag] ?? "bg-white/20 text-gray-300"} capitalize backdrop-blur-sm`}>
                        {re.tag}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(re.startDate)}</p>
                  <h3 className="font-semibold text-white mt-1.5 group-hover:text-gray-200 transition-colors text-lg">{re.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{re.address}</p>
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
