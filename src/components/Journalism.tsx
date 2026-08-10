"use client";

import Link from "next/link";
import ScrollColorImage from "./ScrollColorImage";
import CurtainReveal from "./CurtainReveal";
import type { LandingSectionText } from "@/lib/landing";

interface ReadConfig extends LandingSectionText {
  imageSrc?: string;
}

/**
 * "Read" section — mirrored curtain reveal (image slides from right).
 */
export default function Journalism({ config }: { config?: ReadConfig }) {
  return (
    <section id="read-section" className="py-10 sm:py-12 lg:py-16">
      <CurtainReveal
        mirrored
        image={
          <ScrollColorImage
            src={config?.imageSrc || "/images/journalism.jpg"}
            alt="Read — editorial and long-form"
            className="h-full md:rounded-tl-[6px] md:rounded-bl-[6px]"
          />
        }
      >
        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold flex items-center gap-2 text-dsh-text-primary">
          {config?.heading || "Read"}
          <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="3.5" stroke="#5D94B9"/>
            <path d="M20.188 10.9343C20.5762 11.4056 20.7703 11.6412 20.7703 12C20.7703 12.3588 20.5762 12.5944 20.188 13.0657C18.7679 14.7899 15.6357 18 12 18C8.36427 18 5.23206 14.7899 3.81197 13.0657C3.42381 12.5944 3.22973 12.3588 3.22973 12C3.22973 11.6412 3.42381 11.4056 3.81197 10.9343C5.23206 9.21014 8.36427 6 12 6C15.6357 6 18.7679 9.21014 20.188 10.9343Z" stroke="#5D94B9"/>
          </svg>
        </h3>
        <p className="text-xs sm:text-sm text-dsh-desc mt-2 sm:mt-3 md:mt-4 leading-relaxed max-w-lg line-clamp-4 min-h-[4.9rem] sm:min-h-[5.7rem]">
          {config?.description ||
            "Reporting, essays, and long-form work that names systems of power, preserves testimony, and refuses the official frame. Stories made politically inconvenient, told with rigour and context."}
        </p>
        <Link
          href="/read"
          className="mt-3 sm:mt-4 md:mt-6 inline-block self-start text-xs sm:text-sm border border-white/15 rounded-[3px] px-4 sm:px-6 py-2 sm:py-2.5 text-[#F0F0F0]/40 hover:text-[#F0F0F0]/60 hover:border-white/25 transition-colors"
        >
          {config?.cta || "Explore Read"} <span className="text-[#5D94B9]">+</span>
        </Link>
      </CurtainReveal>
    </section>
  );
}
