"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useCinematicScroll } from "@/hooks/useParallax";
import ScrollColorImage from "./ScrollColorImage";

/* ── Films sub-section ── */
function Films() {
  const { ref, image, text, button } = useCinematicScroll();

  return (
    <div ref={ref} className="flex flex-col md:flex-row items-center mb-20 sm:mb-24 lg:mb-28">
      <motion.div
        style={image}
        className="w-full md:w-1/2 px-5 sm:px-8 md:px-0"
      >
        <ScrollColorImage
          src="/images/slider1.jpg"
          alt="Elderly hands clasped together"
          className="aspect-[9/2] max-md:rounded-lg md:rounded-tr-[6px] md:rounded-br-[6px]"
        />
      </motion.div>
      <motion.div
        style={text}
        className="w-full md:w-1/2 px-5 sm:px-8 md:pl-14 md:pr-[max(2rem,calc((100vw-1400px)/2+2rem))]"
      >
        <h3 className="text-xl md:text-2xl font-semibold flex items-center gap-2 text-dsh-text-primary">
          Films
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.2111 11.1056L9.73666 7.86833C8.93878 7.46939 8 8.04958 8 8.94164V15.0584C8 15.9504 8.93878 16.5306 9.73666 16.1317L16.2111 12.8944C16.9482 12.5259 16.9482 11.4741 16.2111 11.1056Z" stroke="#B23495" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </h3>
        <p className="text-sm text-dsh-desc mt-4 leading-relaxed max-w-lg">
          Documentary and fiction that stay close — to siege, displacement,
          and the daily labour of remaining human — and refuse the distance
          through which violence is made acceptable. Festivals, screenings,
          distribution, and the political context around each film.
        </p>
        <motion.div style={button}>
          <Link href="/film/free-fish" className="mt-6 inline-block text-sm border border-dsh-text-primary/20 rounded-[3px] px-5 py-2 bg-dsh-btn-bg/20 text-dsh-text-primary/40 hover:text-dsh-text-primary/60 hover:bg-dsh-btn-bg/30 transition-colors">
            Explore Films <span className="text-[#B23495]">+</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ── Studio sub-section (mirrored) ── */
function Studio() {
  const { ref, image, text, button } = useCinematicScroll();

  return (
    <div ref={ref} id="studio" className="flex flex-col md:flex-row-reverse items-center">
      <motion.div
        style={image}
        className="w-full md:w-1/2 px-5 sm:px-8 md:px-0"
      >
        <ScrollColorImage
          src="/images/studio.jpg"
          alt="Studio portrait"
          className="aspect-[9/2] max-md:rounded-lg md:rounded-tl-[6px] md:rounded-bl-[6px]"
        />
      </motion.div>
      <motion.div
        style={text}
        className="w-full md:w-1/2 px-5 sm:px-8 md:pr-14 md:pl-[max(2rem,calc((100vw-1400px)/2+2rem))]"
      >
        <h3 className="text-xl md:text-2xl font-semibold flex items-center gap-2 text-dsh-text-primary">
          Studio
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="3" width="6" height="11" rx="3" stroke="#8665A7" strokeLinejoin="round"/>
            <path d="M5.5 11C5.5 12.7239 6.18482 14.3772 7.40381 15.5962C8.62279 16.8152 10.2761 17.5 12 17.5C13.7239 17.5 15.3772 16.8152 16.5962 15.5962C17.8152 14.3772 18.5 12.7239 18.5 11" stroke="#8665A7" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 21V19" stroke="#8665A7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </h3>
        <p className="text-sm text-dsh-desc mt-4 leading-relaxed max-w-lg">
          Docuseries, videocasts, podcasts, and series — and the production
          and co-production capacity behind them. Bold, independent media
          that strengthens movements, made with the same politics and care.
        </p>
        <motion.div style={button}>
          <Link href="/film/beneath-the-canopy" className="mt-6 inline-block text-sm border border-dsh-text-primary/20 rounded-[3px] px-5 py-2 bg-dsh-btn-bg/20 text-dsh-text-primary/40 hover:text-dsh-text-primary/60 hover:bg-dsh-btn-bg/30 transition-colors">
            Explore Studio <span className="text-[#8665A7]">+</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ── Section header ── */
function SectionHeader() {
  const { ref, text } = useCinematicScroll();

  return (
    <div ref={ref} className="max-w-[1400px] mx-auto px-5 sm:px-8">
      <motion.div style={text} className="mb-16 sm:mb-20 lg:mb-24">
        <p className="text-xs tracking-[0.25em] text-dsh-label uppercase mb-4">
          The work, in its forms
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-semibold leading-tight max-w-5xl text-dsh-text-primary">
          Films, series, journalism, and education
          <br className="hidden sm:block" />
          that name power and refuse erasure.
        </h2>
      </motion.div>
    </div>
  );
}

export default function TheWork() {
  return (
    <section id="films" className="py-10 sm:py-12 lg:py-16">
      <SectionHeader />
      <Films />
      <Studio />
    </section>
  );
}
