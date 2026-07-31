"use client";

import { useReveal } from "@/hooks/useReveal";
import ScrollColorImage from "./ScrollColorImage";

export default function Journalism() {
  const sectionRef = useReveal();

  return (
    <section className="py-16 sm:py-20 lg:py-24 space-y-20 sm:space-y-24 lg:space-y-28" ref={sectionRef}>
      {/* Journalism — image bleeds full-width to the left edge, stopping at page center */}
      <div className="flex flex-col md:flex-row items-center">
        <div className="reveal-left stagger-1 w-full md:w-1/2 px-5 sm:px-8 md:px-0">
          <ScrollColorImage src="/images/journalism.jpg" alt="Journalist with glasses" className="aspect-[9/2] max-md:rounded-lg md:rounded-tr-[6px] md:rounded-br-[6px]" />
        </div>
        <div className="reveal-right stagger-2 w-full md:w-1/2 px-5 sm:px-8 md:pl-14 md:pr-[max(2rem,calc((100vw-1400px)/2+2rem))]">
          <h3 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
            Journalism
            <span className="text-gray-500">👁</span>
          </h3>
          <p className="text-sm text-gray-400 mt-4 leading-relaxed max-w-lg">
            Reporting and long-form work that names systems of power,
            preserves testimony, and refuses the official frame. Stories
            made politically inconvenient, told with rigour and context.
          </p>
          <button className="mt-6 text-sm border border-white/15 rounded-full px-5 py-2 text-white hover:bg-white/5 transition-colors">
            Explore journalism +
          </button>
        </div>
      </div>

      {/* Political Education — mirrored: text left, image bleeds full-width to the right edge */}
      <div className="flex flex-col md:flex-row-reverse items-center">
        <div className="reveal-right stagger-1 w-full md:w-1/2 px-5 sm:px-8 md:px-0">
          <ScrollColorImage src="/images/political-education.jpg" alt="Education workshop" className="aspect-[9/2] max-md:rounded-lg md:rounded-tl-[6px] md:rounded-bl-[6px]" />
        </div>
        <div className="reveal-left stagger-2 w-full md:w-1/2 px-5 sm:px-8 md:pr-14 md:pl-[max(2rem,calc((100vw-1400px)/2+2rem))]">
          <h3 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
            Political Education
            <span className="text-gray-500">🌐</span>
          </h3>
          <p className="text-sm text-gray-400 mt-4 leading-relaxed max-w-lg">
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
