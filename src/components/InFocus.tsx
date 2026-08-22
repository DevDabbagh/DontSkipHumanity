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
      <div className="absolute inset-x-0 bottom-[15%] top-[48%] pointer-events-none select-none overflow-hidden">
        <img
          src={image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectPosition: "center 42%",
            filter: "grayscale(1)",
            opacity: 0.05,
          }}
        />
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
                className="aspect-[360/470] rounded-[6px] border-[1.5px] border-[#F0F0F0]/10 shadow-[0_6px_20px_2px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>

          {/* Text content — fits within the portrait height (vertically centered) */}
          <div className="reveal-right w-full md:flex-1 md:min-h-[470px] md:flex md:flex-col md:justify-center">
            <p className="text-[10px] tracking-[0.3em] text-dsh-label/40 uppercase mb-5">
              {config?.subtitle || "In Focus"}
            </p>

            <p className="text-sm text-[#8665A7] mb-4">{config?.meta || "Youtube series · 2026"}</p>

            <h2 className="text-[24px] leading-[32px] md:text-[30px] md:leading-[40px] tracking-[-1px] font-semibold text-white whitespace-pre-line">
              {config?.heading || "We look where the world\nis told not to look"}
            </h2>

            <p className="text-[#8665A7] text-sm mt-16 lg:mt-[100px] mb-5">{config?.personName || "Catarina Marques Rodrigues"}</p>

            <p className="font-[family-name:var(--font-source-sans)] text-[16px] leading-[24px] tracking-[0.5px] text-dsh-desc max-w-[600px]">
              {config?.description ||
                "Documentary and fiction that stay close — to siege, displacement, and the daily labour of remaining human — and refuse the distance through which violence is made acceptable. Festivals, screenings, distribution, and the political context around each film."}
            </p>

            <div className="flex items-center gap-5 mt-10">
              <button className="inline-flex items-center gap-1.5 text-[13px] font-medium px-[14px] py-[12px] rounded-[3px] border border-[#F0F0F0]/15 bg-[#1B1B1B]/20 backdrop-blur-[3px] text-[#F0F0F0]/40 hover:text-[#F0F0F0]/60 hover:border-[#F0F0F0]/25 transition-colors">
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
