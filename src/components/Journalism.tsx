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
          <h3 className="text-xl md:text-2xl font-semibold flex items-center gap-2 text-dsh-text-primary">
            Read
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3.5" stroke="#5D94B9"/>
              <path d="M20.188 10.9343C20.5762 11.4056 20.7703 11.6412 20.7703 12C20.7703 12.3588 20.5762 12.5944 20.188 13.0657C18.7679 14.7899 15.6357 18 12 18C8.36427 18 5.23206 14.7899 3.81197 13.0657C3.42381 12.5944 3.22973 12.3588 3.22973 12C3.22973 11.6412 3.42381 11.4056 3.81197 10.9343C5.23206 9.21014 8.36427 6 12 6C15.6357 6 18.7679 9.21014 20.188 10.9343Z" stroke="#5D94B9"/>
            </svg>
          </h3>
          <p className="text-sm text-dsh-desc mt-4 leading-relaxed max-w-lg">
            Reporting, essays, and long-form work that names systems of
            power, preserves testimony, and refuses the official frame.
            Stories made politically inconvenient, told with rigour and
            context.
          </p>
          <Link
            href="/read"
            className="mt-6 inline-block text-sm border border-dsh-text-primary/20 rounded-[3px] px-5 py-2 bg-dsh-btn-bg/20 text-dsh-text-primary/40 hover:text-dsh-text-primary/60 hover:bg-dsh-btn-bg/30 transition-colors"
          >
            Explore Read <span className="text-[#5D94B9]">+</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
