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

      {/* Figma 303:557 — text column 559px, form column 500px.
          Rhythm: heading → 60px → description → 60px → form → 30px → consent. */}
      <div className="relative max-w-[559px] mx-auto px-5 sm:px-8 text-center">
        {/* H2_Desktop_DSH — Inter SemiBold 38/40, letter-spacing -1.5% (= -0.57px) */}
        <h2 className="reveal text-[28px] sm:text-[32px] md:text-[38px] leading-[32px] sm:leading-[36px] md:leading-[40px] tracking-[-0.57px] font-semibold text-white">
          {config?.heading || "Don't look away."}
        </h2>

        {/* Body-Medium_Desktop_DSH — Source Sans 3 16/24, letter-spacing -0.5% (= -0.08px) */}
        <p className="reveal stagger-1 font-[family-name:var(--font-source-sans)] text-[15px] md:text-[16px] leading-[24px] tracking-[-0.08px] text-[#595C5C] mt-10 md:mt-[60px]">
          {config?.description ||
            "One email when something matters — a new film, a piece, a screening, an open call. Work that names what power tries to hide. No noise."}
        </p>

        {/* Form column — 500px wide, input + button stacked with a 20px gap */}
        <div className="reveal stagger-2 max-w-[500px] mx-auto mt-10 md:mt-[60px] flex flex-col gap-5">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-[44px] p-[14px] rounded-[3px] text-white text-[13px] font-medium focus:outline-none transition-colors"
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

          {/* Gradient applied inline from Figma (303:567) — the shared
              .gradient-fill-btn class uses a different angle and colours. */}
          <button
            disabled={!agreed}
            className="w-full h-[44px] p-[14px] rounded-[3px] border border-[#F0F0F0]/20 text-[13px] font-medium text-[#F0F0F0] flex items-center justify-center gap-[7px] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundImage: "linear-gradient(95.17deg, #32C6CC 0.11%, #B23495 100.11%)" }}
          >
            {config?.cta || "Subscribe our newsletter"}
            <img src="/images/ic_newsletter_btn.png" alt="" className="w-4 h-3 object-contain" />
          </button>
        </div>

        {/* Consent — 30px below the form. Checkbox added per #36; text style
            matches Figma 303:570 (Inter Medium 12, #595C5C, centered). */}
        <label className="reveal stagger-3 max-w-[500px] mx-auto mt-[30px] flex items-center justify-center gap-2 text-[12px] font-medium text-[#595C5C] cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="h-4 w-4 shrink-0 accent-[#8665A7]"
          />
          <span>{config?.subtitle || "I agree to receive emails from DSH. We don't share your data."}</span>
        </label>
      </div>
    </section>
  );
}
