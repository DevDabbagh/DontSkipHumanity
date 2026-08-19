"use client";

import { useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import type { LandingSectionText } from "@/lib/landing";

interface NewsletterConfig extends LandingSectionText {
  imageSrc?: string;
}

export default function Newsletter({ config }: { config?: NewsletterConfig }) {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const sectionRef = useReveal();

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden" ref={sectionRef}>
      {/* Background image — ic_newsletter, B&W with shadow */}
      <img
        src={config?.imageSrc || "/images/newsletter-bg.jpg"}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "grayscale(1) brightness(0.25) contrast(1.1)" }}
      />
      {/* Dark overlay for depth */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative max-w-[500px] mx-auto px-5 sm:px-8 text-center">
        <h2 className="reveal text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          {config?.heading || "Don't look away."}
        </h2>

        <p className="reveal stagger-1 text-xs sm:text-sm text-[#595C5C] mt-4 sm:mt-5 leading-relaxed whitespace-pre-line line-clamp-2">
          {config?.description ||
            "One email when something matters — a new film, a piece, a screening, an open call.\nWork that names what power tries to hide. No noise."}
        </p>

        {/* Email input */}
        <div className="reveal stagger-2 mt-8 space-y-3">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-[44px] px-4 rounded-[3px] text-white text-sm focus:outline-none transition-colors"
            style={{
              backgroundColor: "rgba(54, 54, 54, 0.30)",
              border: "1px solid rgba(240, 240, 240, 0.20)",
            }}
          />
          <style jsx>{`
            input::placeholder {
              color: #595C5C;
            }
          `}</style>

          {/* Consent checkbox — must be ticked before subscribing */}
          <label className="flex items-start gap-2 text-left text-xs text-[#595C5C] cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#8665A7]"
            />
            <span>{config?.subtitle || "I agree to receive emails from DSH. We don't share your data."}</span>
          </label>

          <button
            disabled={!agreed}
            className="w-full h-[44px] rounded-[3px] gradient-fill-btn border border-[#F0F0F0]/20 text-sm text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {config?.cta || "Subscribe our newsletter"}
            <img src="/images/ic_newsletter_btn.png" alt="" className="w-4 h-4 object-contain" />
          </button>
        </div>
      </div>
    </section>
  );
}
