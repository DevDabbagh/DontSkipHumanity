"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import ScrollColorImage from "./ScrollColorImage";

/**
 * "Read" section on the landing page — mirrored full-bleed layout
 * (text left, image bleeds right) matching the Studio pattern.
 * Replaces the old Journalism component.
 */
export default function Journalism() {
  const sectionRef = useReveal();

  return (
    <section id="read-section" className="py-12 sm:py-16 lg:py-20" ref={sectionRef}>
      {/* Read — mirrored: text left, image bleeds full-width to the right edge */}
      <div className="flex flex-col md:flex-row-reverse items-center">
        <div className="reveal-right stagger-1 w-full md:w-1/2 px-5 sm:px-8 md:px-0">
          <ScrollColorImage
            src="/images/journalism.jpg"
            alt="Read — editorial and long-form"
            className="aspect-[9/2] max-md:rounded-lg md:rounded-tl-[6px] md:rounded-bl-[6px]"
          />
        </div>
        <div className="reveal-left stagger-2 w-full md:w-1/2 px-5 sm:px-8 md:pr-14 md:pl-[max(2rem,calc((100vw-1400px)/2+2rem))]">
          <h3 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
            Read
            {/* Editorial / open-book icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 7.5C12 7.5 12 4 8 3.5C5.5 3.2 3 4 2 5V18.5C3 17.5 5.5 17 8 17.2C10.5 17.5 12 19 12 19M12 7.5V19M12 7.5C12 7.5 12 4 16 3.5C18.5 3.2 21 4 22 5V18.5C21 17.5 18.5 17 16 17.2C13.5 17.5 12 19 12 19" stroke="#E8563F" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </h3>
          <p className="text-sm text-gray-400 mt-4 leading-relaxed max-w-lg">
            Reporting, essays, and long-form work that names systems of
            power, preserves testimony, and refuses the official frame.
            Stories made politically inconvenient, told with rigour and
            context.
          </p>
          <Link
            href="/read"
            className="mt-6 inline-block text-sm border border-white/15 rounded-[3px] px-5 py-2 text-white hover:bg-white/5 transition-colors"
          >
            Explore Read <span className="text-[#E8563F]">+</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
