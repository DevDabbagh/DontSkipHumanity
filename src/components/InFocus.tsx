"use client";

import { useReveal } from "@/hooks/useReveal";
import ScrollColorImage from "./ScrollColorImage";

export default function InFocus() {
  const sectionRef = useReveal();

  return (
    <section className="relative py-10 sm:py-12 lg:py-16 overflow-hidden" ref={sectionRef}>
      {/* ── Background: same portrait image, cropped to lower body, barely visible ── */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/images/infocus.jpg"
          alt=""
          className="absolute w-full h-full object-cover blur-[2px]"
          style={{
            objectPosition: "70% 85%",
            transform: "scale(2.5)",
            transformOrigin: "70% 85%",
            filter: "brightness(0.12) contrast(0.8) saturate(0.7) blur(2px)",
            opacity: 0.07,
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.88)]" />
        {/* Subtle radial glow so the section isn't perfectly flat */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_50%,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
      </div>

      {/* Content */}
      <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8 py-8 sm:py-12 lg:py-16">
        <div className="flex flex-col md:flex-row items-start gap-10 md:gap-16">
          {/* Portrait thumbnail — visual anchor */}
          <div className="reveal-left w-full md:w-5/12 max-w-[420px]">
            <ScrollColorImage
              src="/images/infocus.jpg"
              alt="Catarina Marques Rodrigues"
              className="aspect-square rounded-[4px] shadow-xl shadow-black/30 border border-white/[0.06]"
            />
          </div>

          {/* Text content — aligned with the upper portion of the portrait */}
          <div className="reveal-right w-full md:w-7/12 md:pt-2">
            <p className="text-[10px] tracking-[0.3em] text-dsh-label/40 uppercase mb-5">
              In Focus
            </p>

            <p className="text-sm text-[#8665A7] mb-4">Youtube series · 2026</p>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight text-white">
              We look where the world
              <br />
              is told not to look
            </h2>

            <p className="text-[#8665A7] text-sm mt-8 mb-4">Catarina Marques Rodrigues</p>

            <p className="text-sm text-dsh-desc leading-relaxed max-w-xl">
              Documentary and fiction that stay close — to siege, displacement,
              and the daily labour of remaining human — and refuse the distance
              through which violence is made acceptable. Festivals, screenings,
              distribution, and the political context around each film.
            </p>

            <div className="flex items-center gap-5 mt-10">
              <button className="text-sm border border-dsh-text-primary/15 rounded-[3px] px-5 py-2 text-dsh-text-primary/40 hover:text-dsh-text-primary/60 hover:border-dsh-text-primary/25 transition-colors">
                view more <span className="text-[#8665A7]">+</span>
              </button>
              <a href="#support" className="text-sm text-dsh-desc hover:text-dsh-text-primary transition-colors">
                Support our work
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
