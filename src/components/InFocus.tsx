"use client";

import { useReveal } from "@/hooks/useReveal";
import ScrollColorImage from "./ScrollColorImage";

export default function InFocus() {
  const sectionRef = useReveal();

  return (
    <section className="relative py-10 sm:py-12 lg:py-20 pb-16 sm:pb-20 lg:pb-28 overflow-hidden" ref={sectionRef}>
      {/* ── Background: same portrait, lower-body crop, atmospheric — visible but
          never the focal point. Extends well past the content into the transition ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ bottom: "-4rem" }}>
        <img
          src="/images/infocus.jpg"
          alt=""
          className="absolute w-full h-full object-cover"
          style={{
            objectPosition: "70% 88%",
            transform: "scale(2.5)",
            transformOrigin: "70% 88%",
            filter: "brightness(0.15) contrast(0.85) saturate(0.80) blur(2px)",
            opacity: 0.075,
          }}
        />
        {/* Cinematic overlay — image reads as atmosphere, not a picture */}
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.86)]" />
        {/* Vignette: edges darker, center barely lifted */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_45%_50%,transparent_0%,transparent_55%,rgba(0,0,0,0.30)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_50%,rgba(255,255,255,0.015)_0%,transparent_65%)]" />
        {/* Near-imperceptible noise texture */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8 py-8 sm:py-12 lg:py-16">
        <div className="flex flex-col md:flex-row items-start gap-10 md:gap-[4.5rem]">
          {/* Portrait thumbnail — visual anchor, slightly smaller for editorial breathing room */}
          <div className="reveal-left w-full md:w-[39%] max-w-[396px]">
            <div style={{ filter: "brightness(0.95) contrast(0.95) saturate(0.90)" }}>
              <ScrollColorImage
                src="/images/infocus.jpg"
                alt="Catarina Marques Rodrigues"
                className="aspect-square rounded-[4px] shadow-xl shadow-black/30 border border-white/[0.08]"
              />
            </div>
          </div>

          {/* Text content — top-aligned with portrait, not centered */}
          <div className="reveal-right w-full md:w-[61%] md:pt-1">
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

            <p className="text-sm text-dsh-desc leading-relaxed max-w-[600px]">
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
