"use client";

import { useReveal } from "@/hooks/useReveal";
import ScrollColorImage from "./ScrollColorImage";

export default function InFocus() {
  const sectionRef = useReveal();

  return (
    <section className="py-16 sm:py-20 lg:py-24 relative" ref={sectionRef}>
      {/* Background strip (شريط) — cropped bottom portion of the same image,
          stretched full-width behind the content as a dark atmospheric band */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[320px] sm:h-[380px] md:h-[420px]">
          <img
            src="/images/infocus.jpg"
            alt=""
            className="w-full h-full object-cover object-bottom opacity-[0.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-transparent to-[#0D0D0D]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D] via-transparent to-[#0D0D0D]" />
        </div>
      </div>

      <div className="relative flex flex-col md:flex-row items-center">
        {/* Portrait thumbnail — bleeds to the left edge on desktop */}
        <div className="reveal-left w-full md:w-5/12 px-5 sm:px-8 md:px-0">
          <ScrollColorImage
            src="/images/infocus.jpg"
            alt="Catarina Marques Rodrigues"
            className="aspect-[3/4] max-w-[400px] max-md:rounded-lg md:aspect-auto md:max-w-none md:h-[520px] md:rounded-tr-[6px] md:rounded-br-[6px]"
          />
        </div>

        {/* Content */}
        <div className="reveal-right w-full md:w-7/12 px-5 sm:px-8 md:pl-14 md:pr-[max(2rem,calc((100vw-1400px)/2+2rem))] md:pt-4 mt-8 md:mt-0">
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
    </section>
  );
}
