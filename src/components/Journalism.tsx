"use client";

import { useReveal } from "@/hooks/useReveal";

export default function Journalism() {
  const sectionRef = useReveal();

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-5 sm:px-8 max-w-[1400px] mx-auto space-y-16 sm:space-y-20 lg:space-y-28" ref={sectionRef}>
      {/* Journalism — image left, text right */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
        <div className="reveal-left stagger-1 md:w-1/2">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <img
              src="/images/journalism.jpg"
              alt="Journalist with glasses"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="reveal-right stagger-2 md:w-1/2 md:pt-8">
          <h3 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
            Journalism
            <span className="text-gray-500">👁</span>
          </h3>
          <p className="text-gray-400 mt-4 leading-relaxed max-w-lg">
            Reporting and long-form work that names systems of power,
            preserves testimony, and refuses the official frame. Stories
            made politically inconvenient, told with rigour and context.
          </p>
          <button className="mt-6 text-sm border border-white/15 rounded-full px-5 py-2 text-white hover:bg-white/5 transition-colors">
            Explore journalism +
          </button>
        </div>
      </div>

      {/* Political Education — text left, image right */}
      <div className="flex flex-col md:flex-row-reverse gap-8 md:gap-16 items-start">
        <div className="reveal-right stagger-1 md:w-1/2">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <img
              src="/images/political-education.jpg"
              alt="Education workshop"
              className="w-full h-full object-cover grayscale"
            />
          </div>
        </div>
        <div className="reveal-left stagger-2 md:w-1/2 md:pt-8">
          <h3 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
            Political Education
            <span className="text-gray-500">🌐</span>
          </h3>
          <p className="text-gray-400 mt-4 leading-relaxed max-w-lg">
            Free, and built as infrastructure rather than content. Tools for
            ethical narrative, journalism, and organising — for journalists,
            organisers, filmmakers, and political organisations who already
            carry the stakes.
          </p>
          <button className="mt-6 text-sm border border-white/15 rounded-full px-5 py-2 text-white hover:bg-white/5 transition-colors">
            Explore academy +
          </button>
        </div>
      </div>
    </section>
  );
}
