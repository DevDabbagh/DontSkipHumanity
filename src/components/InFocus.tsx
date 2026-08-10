"use client";

import { useReveal } from "@/hooks/useReveal";
import ScrollColorImage from "./ScrollColorImage";
import type { LandingSectionText } from "@/lib/landing";

interface InFocusConfig extends LandingSectionText {
  imageSrc?: string;
}

export default function InFocus({ config }: { config?: InFocusConfig }) {
  const sectionRef = useReveal();
  const image = config?.imageSrc || "/images/infocus.jpg";

  return (
    <section className="relative py-10 sm:py-12 lg:py-20 pb-16 sm:pb-20 lg:pb-28 overflow-hidden" ref={sectionRef}>
      {/* ── Layer 1: Background band ──
          The SAME portrait, zoomed into its lower-face / neck region, shown as
          a full-width horizontal band that begins ~40% down the section and
          runs to the bottom — sitting behind the name, description and buttons.
          Grayscale, darkened, with the top & bottom edges fading into black. */}
      <div className="absolute inset-x-0 bottom-0 top-[40%] pointer-events-none select-none overflow-hidden">
        <img
          src={image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectPosition: "center 42%",
            filter: "grayscale(1) brightness(0.6) contrast(0.95)",
            opacity: 0.7,
          }}
        />
        {/* gentle darkening so text stays readable */}
        <div className="absolute inset-0 bg-black/30" />
        {/* top edge fades in from the black above */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0A0A0A] to-transparent" />
        {/* bottom edge fades back into the page */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
      </div>

      {/* ── Layer 2: Content ── */}
      <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8 py-8 sm:py-12 lg:py-16">
        <div className="flex flex-col md:flex-row items-start gap-10 md:gap-[4.5rem]">
          {/* Portrait thumbnail card — 360×470 ratio (matches design) */}
          <div className="reveal-left w-full md:w-[360px] shrink-0">
            <div style={{ filter: "brightness(0.95) contrast(0.95) saturate(0.90)" }}>
              <ScrollColorImage
                src={image}
                alt={config?.personName || "Catarina Marques Rodrigues"}
                className="aspect-[360/470] rounded-[4px] shadow-xl shadow-black/30 border border-white/[0.08]"
              />
            </div>
          </div>

          {/* Text content — top-aligned with portrait */}
          <div className="reveal-right w-full md:flex-1 md:pt-1">
            <p className="text-[10px] tracking-[0.3em] text-dsh-label/40 uppercase mb-5">
              {config?.subtitle || "In Focus"}
            </p>

            <p className="text-sm text-[#8665A7] mb-4">{config?.meta || "Youtube series · 2026"}</p>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight text-white whitespace-pre-line">
              {config?.heading || "We look where the world\nis told not to look"}
            </h2>

            <p className="text-[#8665A7] text-sm mt-8 mb-4">{config?.personName || "Catarina Marques Rodrigues"}</p>

            <p className="text-sm text-dsh-desc leading-relaxed max-w-[600px]">
              {config?.description ||
                "Documentary and fiction that stay close — to siege, displacement, and the daily labour of remaining human — and refuse the distance through which violence is made acceptable. Festivals, screenings, distribution, and the political context around each film."}
            </p>

            <div className="flex items-center gap-5 mt-10">
              <button className="text-sm border border-dsh-text-primary/15 rounded-[3px] px-5 py-2 text-dsh-text-primary/40 hover:text-dsh-text-primary/60 hover:border-dsh-text-primary/25 transition-colors">
                {config?.cta || "view more"} <span className="text-[#8665A7]">+</span>
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
