"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DriftingGrid from "@/components/DriftingGrid";
import { useReveal } from "@/hooks/useReveal";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase font-medium" style={{ color: "rgba(54,54,54,0.8)", letterSpacing: "0.3em" }}>
      {children}
    </p>
  );
}

function ShieldIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2A2A2A" strokeWidth={1.8}>
      <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const IMPACT_CARDS = [
  {
    label: "FILM — MADE POSSIBLE",
    title: "Beneath the Canopy",
    sub: "847 supporters · 94 min · Sundance 2024",
    img: "/images/slider1.jpg",
    accent: "#9B59B6",
  },
  {
    label: "DOCUMENTARY — IN PRODUCTION",
    title: "The Archive Has No Walls",
    sub: "Currently filming · Palestine · 2025",
    img: "/images/slider2.jpg",
    accent: "#1ABC9C",
  },
  {
    label: "WORKSHOP — SCREENED",
    title: "27 Cities, One Story",
    sub: "Community screenings · Global tour",
    img: "/images/slidere3.jpg",
    accent: "#9B59B6",
  },
];

const OTHER_WAYS = [
  {
    title: "Share the work",
    desc: "Amplify on social media, embed in your newsletter, or forward to someone who needs to see it.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1ABC9C" strokeWidth={1.5}>
        <path d="M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.6 13.5l6.8 3.9M15.4 6.6L8.6 10.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Host a screening",
    desc: "Bring a DSH film to your community, university, or festival — we handle the rights.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1ABC9C" strokeWidth={1.5}>
        <rect x="3" y="5" width="14" height="14" rx="1.5" />
        <path d="M17 9.5l4-2.5v10l-4-2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Partner with us",
    desc: "Co-production, sponsorship, or institutional collaboration. Let's build something together.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1ABC9C" strokeWidth={1.5}>
        <path d="M11 21l-7-7a3 3 0 010-4.2l5.6-5.6a3 3 0 014.2 0L19 9.4M8 12l3 3M11 9l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function SupportPage() {
  const [donationType, setDonationType] = useState<"Monthly" | "One-time">("Monthly");
  const [amount, setAmount] = useState("€25");
  const [customAmount, setCustomAmount] = useState("");
  const r2 = useReveal();
  const r3 = useReveal();
  const r4 = useReveal();

  return (
    <main className="relative bg-[#0D0D0D]">
      <div className="film-grain" />
      <Navbar />

      {/* S1 — Hero + donation card over drifting grid */}
      <div
        className="relative flex flex-col items-center justify-center text-center px-8 overflow-hidden"
        style={{ minHeight: "100vh", paddingTop: 120, paddingBottom: 80 }}
      >
        <DriftingGrid />

        <div className="relative" style={{ zIndex: 1, marginBottom: 48 }}>
          <p
            style={{
              fontSize: 11,
              color: "#1ABC9C",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: 20,
              animation: "heroLine 900ms cubic-bezier(0.16,1,0.3,1) 100ms both",
            }}
          >
            Independent · Ad-free · Reader-supported
          </p>
          <h1
            style={{
              fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)",
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              animation: "heroLine 900ms cubic-bezier(0.16,1,0.3,1) 300ms both",
            }}
          >
            Fund the work
          </h1>
          <h1
            className="shimmer-text"
            style={{
              fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)",
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              marginTop: 6,
              animation: "heroLine 900ms cubic-bezier(0.16,1,0.3,1) 500ms both",
            }}
          >
            that names power.
          </h1>
          <p
            style={{
              fontSize: "clamp(0.95rem, 1.4vw, 1.05rem)",
              color: "rgba(200,200,200,0.6)",
              maxWidth: 480,
              lineHeight: 1.75,
              marginTop: 24,
              marginLeft: "auto",
              marginRight: "auto",
              animation: "heroLine 900ms cubic-bezier(0.16,1,0.3,1) 700ms both",
            }}
          >
            No ads. No algorithms. No sponsors shaping what gets told.
            <br />
            This work exists because people like you make it possible.
          </p>
        </div>

        {/* Donation card */}
        <div
          className="relative w-full"
          style={{ zIndex: 1, maxWidth: 560, animation: "heroLine 900ms cubic-bezier(0.16,1,0.3,1) 900ms both" }}
        >
          <div
            style={{
              background: "rgba(10,10,10,0.88)",
              backdropFilter: "blur(40px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 22,
              overflow: "hidden",
              boxShadow: "0 48px 120px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.03) inset",
            }}
          >
            <div style={{ height: 2, background: "linear-gradient(90deg, transparent 0%, #9B59B6 35%, #1ABC9C 65%, transparent 100%)" }} />

            {/* Type toggle */}
            <div style={{ padding: "24px 28px 0" }}>
              <div style={{ display: "flex", background: "#060606", borderRadius: 10, padding: 4, border: "1px solid rgba(255,255,255,0.06)" }}>
                {(["Monthly", "One-time"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setDonationType(t)}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      fontSize: 13,
                      fontWeight: 500,
                      borderRadius: 8,
                      transition: "all 250ms cubic-bezier(0.22,1,0.36,1)",
                      background: donationType === t ? "#181818" : "transparent",
                      color: donationType === t ? "#F0F0F0" : "#444",
                      boxShadow: donationType === t ? "0 2px 12px rgba(0,0,0,0.5)" : "none",
                      border: donationType === t ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                    }}
                  >
                    {t === "Monthly" && (
                      <span style={{ marginRight: 6, fontSize: 11, color: donationType === t ? "#1ABC9C" : "#444" }}>↻</span>
                    )}
                    {t}
                    {t === "Monthly" && donationType === t && (
                      <span style={{ marginLeft: 8, fontSize: 10, color: "#1ABC9C", background: "rgba(26,188,156,0.12)", padding: "1px 6px", borderRadius: 4 }}>
                        BEST
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount grid */}
            <div style={{ padding: "22px 28px 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 8 }}>
                {["€10", "€25", "€50", "€100"].map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    style={{
                      padding: "14px 0",
                      borderRadius: 8,
                      fontSize: 17,
                      fontWeight: 600,
                      background: amount === a ? "rgba(26,188,156,0.12)" : "rgba(255,255,255,0.04)",
                      color: amount === a ? "#1ABC9C" : "#666",
                      border: amount === a ? "1px solid rgba(26,188,156,0.4)" : "1px solid rgba(255,255,255,0.07)",
                      transition: "all 200ms",
                      position: "relative",
                    }}
                  >
                    {a}
                    {a === "€25" && donationType === "Monthly" && (
                      <span style={{ position: "absolute", top: -8, right: -6, fontSize: 9, background: "#B23495", color: "#fff", padding: "2px 5px", borderRadius: 4 }}>
                        popular
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div
                onClick={() => setAmount("Custom")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderRadius: 8,
                  background: amount === "Custom" ? "rgba(26,188,156,0.06)" : "rgba(255,255,255,0.03)",
                  border: amount === "Custom" ? "1px solid rgba(26,188,156,0.35)" : "1px solid rgba(255,255,255,0.06)",
                  cursor: "text",
                  transition: "all 200ms",
                }}
              >
                <span style={{ fontSize: 15, color: amount === "Custom" ? "#1ABC9C" : "#444", marginRight: 8 }}>€</span>
                <input
                  value={amount === "Custom" ? customAmount : ""}
                  onChange={(e) => {
                    setAmount("Custom");
                    setCustomAmount(e.target.value);
                  }}
                  placeholder="Custom amount"
                  className="outline-none bg-transparent flex-1"
                  style={{ fontSize: 15, color: "#F0F0F0", caretColor: "#1ABC9C" }}
                />
              </div>
            </div>

            {/* Summary row */}
            <div
              style={{
                margin: "18px 28px 0",
                padding: "14px 18px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p style={{ fontSize: 22, fontWeight: 700, color: "#F0F0F0" }}>
                {amount === "Custom" ? (customAmount ? `€${customAmount}` : "€—") : amount}
                <span style={{ fontSize: 13, fontWeight: 400, color: "#444", marginLeft: 6 }}>
                  {donationType === "Monthly" ? "/ month" : "one-time"}
                </span>
              </p>
              <p style={{ fontSize: 11, color: "#3A3A3A" }}>Films · Academy · Fellows</p>
            </div>

            {/* CTA */}
            <div style={{ padding: "16px 28px 26px" }}>
              <button
                className="gradient-fill-btn"
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#FFFFFF",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                }}
              >
                Support now →
              </button>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <ShieldIcon />
                  <span style={{ fontSize: 11, color: "#2A2A2A" }}>Stripe-secured</span>
                </div>
                <span style={{ color: "#1A1A1A" }}>·</span>
                <span style={{ fontSize: 11, color: "#2A2A2A" }}>Cancel anytime</span>
                <span style={{ color: "#1A1A1A" }}>·</span>
                <span style={{ fontSize: 11, color: "#2A2A2A" }}>No fees</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="gradient-divider" />

      {/* S3 — The Work You Make Possible */}
      <div style={{ padding: "80px 32px" }}>
        <div ref={r2} className="reveal" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <SectionLabel>The work you make possible</SectionLabel>
          <p style={{ fontSize: 15, color: "#3A3A3A", marginTop: 12, maxWidth: 480, lineHeight: 1.7, marginBottom: 48 }}>
            These stories exist because people decided they should.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 12, marginBottom: 12 }}>
            {[
              { num: "4,200+", label: "Free courses — forever", accent: "#1ABC9C" },
              { num: "63", label: "Emerging voices funded", accent: "#B23495" },
              { num: "847", label: "Supporters made this film", accent: "#9B59B6" },
            ].map((s) => (
              <div
                key={s.num}
                style={{
                  background: "#0F0F0F",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 14,
                  padding: "28px 24px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(ellipse 70% 60% at 5% 95%, ${s.accent}15 0%, transparent 60%)`,
                  }}
                />
                <p style={{ fontSize: "clamp(2rem,3vw,2.6rem)", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {s.num}
                </p>
                <p style={{ fontSize: 12, color: s.accent, marginTop: 10, fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Film cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 12 }}>
            {IMPACT_CARDS.map((card) => (
              <div
                key={card.title}
                className="relative"
                style={{
                  borderRadius: 14,
                  overflow: "hidden",
                  isolation: "isolate",
                  border: "1px solid rgba(255,255,255,0.06)",
                  height: 340,
                  background: "linear-gradient(135deg, #111 0%, #0a0a0a 100%)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.img}
                  alt={card.title}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) brightness(0.45) contrast(1.1)" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,13,13,0.97) 0%, rgba(13,13,13,0.5) 55%, rgba(13,13,13,0.15) 100%)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px" }}>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", color: card.accent, textTransform: "uppercase", marginBottom: 8 }}>
                    {card.label}
                  </p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.01em", lineHeight: 1.2 }}>{card.title}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>{card.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="gradient-divider" />

      {/* S4 — Quote */}
      <div className="relative flex items-center justify-center" style={{ height: 420, isolation: "isolate" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/note.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "grayscale(1) brightness(0.18) contrast(1.1)" }}
        />
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.82)" }} />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, #0D0D0D 0%, rgba(13,13,13,0.3) 35%, rgba(13,13,13,0.3) 65%, #0D0D0D 100%)" }}
        />
        <div ref={r3} className="reveal relative" style={{ maxWidth: 720, padding: "0 48px", textAlign: "center", zIndex: 1 }}>
          <div style={{ width: 32, height: 1, background: "rgba(26,188,156,0.6)", margin: "0 auto 28px" }} />
          <p style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.85rem)", fontStyle: "italic", color: "rgba(255,255,255,0.88)", lineHeight: 1.5, fontWeight: 300 }}>
            &ldquo;Every film, every free course, every fellow we support — these exist because someone decided
            this work matters.&rdquo;
          </p>
          <p style={{ fontSize: 13, color: "#1ABC9C", marginTop: 24, letterSpacing: "0.12em" }}>— Don&apos;t Skip Humanity</p>
          <div style={{ width: 32, height: 1, background: "rgba(155,89,182,0.6)", margin: "28px auto 0" }} />
        </div>
      </div>

      <div className="gradient-divider" />

      {/* S5 — Other Ways to Contribute */}
      <div style={{ padding: "80px 32px 96px" }}>
        <div ref={r4} className="reveal" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <SectionLabel>Other ways to contribute</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {OTHER_WAYS.map((card, i) => (
              <div
                key={card.title}
                className={`reveal-scale stagger-${i + 1} border border-white/5 hover:border-white/10 transition-colors`}
                style={{
                  background: "#0F0F0F",
                  borderRadius: 16,
                  padding: "32px 28px",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "rgba(26,188,156,0.08)",
                    border: "1px solid rgba(26,188,156,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  {card.icon}
                </div>
                <p style={{ fontSize: 17, fontWeight: 600, color: "#E8E8E8", marginBottom: 10 }}>{card.title}</p>
                <p style={{ fontSize: 13, color: "#484848", lineHeight: 1.7, marginBottom: 20 }}>{card.desc}</p>
                <button style={{ fontSize: 13, color: "#1ABC9C", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  Get in touch →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
