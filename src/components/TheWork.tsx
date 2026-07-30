"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import { useScrollGrayscale } from "@/hooks/useScrollGrayscale";

function StripeImage({ src, alt }: { src: string; alt: string }) {
  const { ref, colorAmount } = useScrollGrayscale<HTMLDivElement>();

  return (
    <div ref={ref} className="relative aspect-[9/2] overflow-hidden">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-[filter] duration-100 ease-out"
        style={{ filter: `grayscale(${1 - colorAmount})` }}
      />
    </div>
  );
}

export default function TheWork() {
  const sectionRef = useReveal();

  return (
    <section id="films" className="py-16 sm:py-20 lg:py-24" ref={sectionRef}>
      {/* Section header — stays within the normal reading column */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
        <div className="reveal mb-16 sm:mb-20 lg:mb-24">
          <p className="text-xs tracking-[0.25em] text-dsh-label uppercase mb-4">
            The work, in its forms
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-semibold leading-tight max-w-5xl text-dsh-text-primary">
            Films, series, journalism, and education
            <br className="hidden sm:block" />
            that name power and refuse erasure.
          </h2>
        </div>
      </div>

      {/* Films — image bleeds full-width to the left edge, stopping at page center.
          The image is a "stripe" (wide, short crop) so it can carry a parallax-style
          scroll treatment: it starts black & white and gains color as it scrolls into view. */}
      <div className="flex flex-col md:flex-row items-center mb-20 sm:mb-24 lg:mb-28">
        <div className="reveal-left stagger-1 w-full md:w-1/2 px-5 sm:px-8 md:px-0">
          <StripeImage src="/images/slider1.jpg" alt="Elderly hands clasped together" />
        </div>
        <div className="reveal-right stagger-2 w-full md:w-1/2 px-5 sm:px-8 md:pl-14 md:pr-[max(2rem,calc((100vw-1400px)/2+2rem))]">
          <h3 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
            Films
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
            </svg>
          </h3>
          <p className="text-sm text-gray-400 mt-4 leading-relaxed max-w-lg">
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

      {/* Studio — mirrored: text left, image bleeds full-width to the right edge. */}
      <div id="studio" className="flex flex-col md:flex-row-reverse items-center">
        <div className="reveal-right stagger-1 w-full md:w-1/2 px-5 sm:px-8 md:px-0">
          <StripeImage src="/images/studio.jpg" alt="Studio portrait" />
        </div>
        <div className="reveal-left stagger-2 w-full md:w-1/2 px-5 sm:px-8 md:pr-14 md:pl-[max(2rem,calc((100vw-1400px)/2+2rem))]">
          <h3 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
            Studio
            <span className="text-gray-500 text-lg">🎙</span>
          </h3>
          <p className="text-sm text-gray-400 mt-4 leading-relaxed max-w-lg">
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
