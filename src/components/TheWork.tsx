"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";

export default function TheWork() {
  const sectionRef = useReveal();

  return (
    <section id="films" className="py-16 sm:py-20 lg:py-24 px-5 sm:px-8 max-w-[1400px] mx-auto" ref={sectionRef}>
      {/* Section header */}
      <div className="reveal mb-12 sm:mb-16 lg:mb-20">
        <p className="text-xs tracking-[0.25em] text-gray-500 uppercase mb-4">
          The work, in its forms
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-semibold leading-tight max-w-3xl">
          Films, series, journalism, and education
          <br />
          that name power and refuse erasure.
        </h2>
      </div>

      {/* Films — image left, text right */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start mb-16 sm:mb-20 lg:mb-28">
        <div className="reveal-left stagger-1 md:w-1/2">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <img
              src="/images/slider1.jpg"
              alt="Elderly hands clasped together"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="reveal-right stagger-2 md:w-1/2 md:pt-8">
          <h3 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
            Films
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
            </svg>
          </h3>
          <p className="text-gray-400 mt-4 leading-relaxed max-w-lg">
            Documentary and fiction that stay close — to siege, displacement,
            and the daily labour of remaining human — and refuse the distance
            through which violence is made acceptable. Festivals, screenings,
            distribution, and the political context around each film.
          </p>
          <Link href="/film/free-fish" className="mt-6 inline-block text-sm border border-white/15 rounded-full px-5 py-2 text-white hover:bg-white/5 transition-colors">
            Explore films +
          </Link>
        </div>
      </div>

      {/* Studio — text left, image right */}
      <div id="studio" className="flex flex-col md:flex-row-reverse gap-8 md:gap-16 items-start">
        <div className="reveal-right stagger-1 md:w-1/2">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <img
              src="/images/studio.jpg"
              alt="Studio portrait"
              className="w-full h-full object-cover grayscale"
            />
          </div>
        </div>
        <div className="reveal-left stagger-2 md:w-1/2 md:pt-8">
          <h3 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
            Studio
            <span className="text-gray-500 text-lg">🎙</span>
          </h3>
          <p className="text-gray-400 mt-4 leading-relaxed max-w-lg">
            Docuseries, videocasts, podcasts, and series — and the production
            and co-production capacity behind them. Bold, independent media
            that strengthens movements, made with the same politics and care.
          </p>
          <Link href="/film/beneath-the-canopy" className="mt-6 inline-block text-sm border border-white/15 rounded-full px-5 py-2 text-white hover:bg-white/5 transition-colors">
            Explore studio +
          </Link>
        </div>
      </div>
    </section>
  );
}
