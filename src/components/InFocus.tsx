"use client";

import { useReveal } from "@/hooks/useReveal";
import ScrollColorImage from "./ScrollColorImage";

export default function InFocus() {
  const sectionRef = useReveal();

  return (
    <section className="relative" ref={sectionRef}>
      {/* Spacer top */}
      <div className="h-16 sm:h-20 lg:h-24" />

      {/* ── Background strip (شريط) — edge-to-edge, bottom-cropped image ── */}
      <div className="relative">
        {/* The strip: full-width band showing the bottom portion of the image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/images/infocus.jpg"
            alt=""
            className="w-full h-full object-cover object-bottom opacity-[0.12]"
          />
          {/* Left/right fade to background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D]/80 via-transparent to-[#0D0D0D]/80" />
          {/* Top/bottom fade so the strip blends into the page */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D] via-transparent to-[#0D0D0D]" />
        </div>

        {/* Content on top of the strip */}
        <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8 py-12 sm:py-16 md:py-20">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Square thumbnail image */}
            <div className="reveal-left w-full md:w-5/12 max-w-[420px]">
              <ScrollColorImage
                src="/images/infocus.jpg"
                alt="Catarina Marques Rodrigues"
                className="aspect-square rounded-[6px]"
              />
            </div>

            {/* Text content */}
            <div className="reveal-right w-full md:w-7/12">
              <p className="text-xs tracking-[0.25em] text-dsh-label uppercase mb-3">
                In Focus
              </p>
              <p className="text-sm text-[#9B59B6]">Youtube series · 2026</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight mt-3 text-dsh-text-primary">
                We look where the world
                <br />
                is told not to look
              </h2>

              <p className="text-[#9B59B6] text-sm mt-6 mb-3">Catarina Marques Rodrigues</p>
              <p className="text-dsh-desc leading-relaxed max-w-lg">
                Documentary and fiction that stay close — to siege, displacement,
                and the daily labour of remaining human — and refuse the distance
                through which violence is made acceptable. Festivals, screenings,
                distribution, and the political context around each film.
              </p>

              <div className="flex items-center gap-4 mt-8">
                <button className="text-sm border border-dsh-text-primary/20 rounded-[3px] px-5 py-2 bg-dsh-btn-bg/20 text-dsh-text-primary/40 hover:text-dsh-text-primary/60 hover:bg-dsh-btn-bg/30 transition-colors">
                  View More <span className="text-[#9B59B6]">+</span>
                </button>
                <a href="#support" className="text-sm text-dsh-desc hover:text-dsh-text-primary transition-colors">
                  Support our work
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer bottom */}
      <div className="h-16 sm:h-20 lg:h-24" />
    </section>
  );
}
