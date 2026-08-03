"use client";

import { useState } from "react";
import { useReveal } from "@/hooks/useReveal";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const sectionRef = useReveal();

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden" ref={sectionRef}>
      {/* Background image — ic_newsletter */}
      <img
        src="/images/newsletter-bg.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.3) contrast(1.05) saturate(0.6)" }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative max-w-xl mx-auto px-5 sm:px-8 text-center">
        <h2 className="reveal text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          Don&apos;t look away.
        </h2>

        <p className="reveal stagger-1 text-xs sm:text-sm text-[#595C5C] mt-4 sm:mt-5 leading-relaxed">
          One email when something matters — a new film, a piece, a screening, an open call.
          <br />
          Work that names what power tries to hide. No noise.
        </p>

        {/* Decorative scissor line */}
        <div className="reveal stagger-2 flex items-center justify-center gap-2 my-6 sm:my-8">
          <div className="flex-1 border-t border-dashed border-[#32C6CC]/30" />
          <svg className="w-4 h-4 text-[#32C6CC]/40 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div className="flex-1 border-t border-dashed border-[#32C6CC]/30" />
        </div>

        {/* Email input */}
        <div className="reveal stagger-3 space-y-3">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3.5 rounded-[3px] border text-white text-sm focus:outline-none focus:border-[#F0F0F0]/30 transition-colors"
            style={{
              backgroundColor: "rgba(54, 54, 54, 0.30)",
              borderColor: "rgba(240, 240, 240, 0.20)",
            }}
          />
          <style jsx>{`
            input::placeholder {
              color: #595C5C;
            }
          `}</style>
          <button className="w-full py-3.5 rounded-[3px] gradient-fill-btn text-sm text-white font-medium flex items-center justify-center gap-2">
            Subscribe our newsletter
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 0.5H12C12.9569 0.5 13.6244 0.500662 14.1279 0.568359C14.6171 0.634128 14.876 0.754944 15.0605 0.939453C15.2451 1.12396 15.3659 1.38289 15.4316 1.87207C15.4993 2.37563 15.5 3.04308 15.5 4V8C15.5 8.95692 15.4993 9.62437 15.4316 10.1279C15.3659 10.6171 15.2451 10.876 15.0605 11.0605C14.876 11.2451 14.6171 11.3659 14.1279 11.4316C13.6244 11.4993 12.9569 11.5 12 11.5H4C3.04308 11.5 2.37563 11.4993 1.87207 11.4316C1.38289 11.3659 1.12396 11.2451 0.939453 11.0605C0.754944 10.876 0.634128 10.6171 0.568359 10.1279C0.500662 9.62437 0.5 8.95692 0.5 8V4C0.5 3.04308 0.500662 2.37563 0.568359 1.87207C0.634128 1.38289 0.754944 1.12396 0.939453 0.939453C1.12396 0.754944 1.38289 0.634128 1.87207 0.568359C2.37563 0.500662 3.04308 0.5 4 0.5Z" stroke="#F0F0F0"/>
            </svg>
          </button>
        </div>

        <p className="reveal stagger-4 text-xs text-[#595C5C] mt-4">
          I agree to receive emails from DSH. We don&apos;t share your data.
        </p>
      </div>
    </section>
  );
}
