"use client";

import { useReveal } from "@/hooks/useReveal";

export default function InFocus() {
  const sectionRef = useReveal();

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-5 sm:px-8 max-w-[1400px] mx-auto" ref={sectionRef}>
      <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
        {/* Image */}
        <div className="reveal-left md:w-5/12">
          <div className="relative aspect-[3/4] max-w-[400px] rounded-lg overflow-hidden">
            <img
              src="/images/infocus.jpg"
              alt="Catarina Marques Rodrigues"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="reveal-right md:w-7/12 md:pt-4">
          <p className="text-xs tracking-[0.25em] text-gray-500 uppercase mb-3">
            In Focus
          </p>
          <p className="text-sm text-[#9B59B6]">Youtube series · 2026</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight mt-3">
            We look where the world
            <br />
            is told not to look
          </h2>

          <div className="gradient-divider my-6 max-w-md" />

          <p className="text-[#9B59B6] text-sm mb-3">Catarina Marques Rodrigues</p>
          <p className="text-gray-400 leading-relaxed max-w-lg">
            Documentary and fiction that stay close — to siege, displacement,
            and the daily labour of remaining human — and refuse the distance
            through which violence is made acceptable. Festivals, screenings,
            distribution, and the political context around each film.
          </p>

          <div className="flex items-center gap-4 mt-8">
            <button className="text-sm border border-white/15 rounded-full px-5 py-2 text-white hover:bg-white/5 transition-colors">
              view more +
            </button>
            <a href="#support" className="text-sm text-gray-400 hover:text-white transition-colors">
              Support our work
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
