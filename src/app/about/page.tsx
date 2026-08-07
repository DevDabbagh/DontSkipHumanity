import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DriftingGrid from "@/components/DriftingGrid";
import SecondaryBtn from "@/components/SecondaryBtn";
import AboutSections from "./AboutSections";

export const metadata: Metadata = {
  title: "About",
  description:
    "Don't Skip Humanity is an independent media company creating films, journalism, and educational projects rooted in dignity, witness, and collective liberation.",
};

export default function AboutPage() {
  return (
    <main className="relative bg-[#0D0D0D]">
      <div className="film-grain" />
      <Navbar />

      {/* S1 — Hero with drifting image grid */}
      <div
        className="flex flex-col items-center justify-center text-center px-8 relative overflow-hidden"
        style={{ height: "100vh" }}
      >
        <DriftingGrid />
        <div className="relative" style={{ zIndex: 1 }}>
          <h1
            style={{
              fontSize: "clamp(2.2rem, 5vw, 4rem)",
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              animation: "heroLine 900ms cubic-bezier(0.16,1,0.3,1) 300ms both",
            }}
          >
            We don&apos;t look away.
          </h1>
          <p
            style={{
              fontSize: "clamp(0.95rem, 1.4vw, 1.15rem)",
              fontWeight: 400,
              color: "rgba(200,200,200,0.72)",
              maxWidth: 560,
              lineHeight: 1.7,
              marginTop: 24,
              marginLeft: "auto",
              marginRight: "auto",
              animation: "heroLine 900ms cubic-bezier(0.16,1,0.3,1) 550ms both",
            }}
          >
            Don&apos;t Skip Humanity is an independent media company creating films,
            journalism, and educational projects rooted in dignity, witness, and
            collective liberation.
          </p>
          <div
            style={{
              width: 80,
              height: 1,
              background: "linear-gradient(90deg, transparent, #9B59B6, #1ABC9C, transparent)",
              margin: "40px auto 0",
              animation: "heroLine 900ms cubic-bezier(0.16,1,0.3,1) 800ms both",
            }}
          />
        </div>
      </div>

      <div className="gradient-divider" />

      {/* Client-rendered scroll-reveal sections */}
      <AboutSections />

      {/* S6 — Press & Partnerships */}
      <div style={{ background: "#161616", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-[600px] mx-auto text-center" style={{ padding: "64px 32px" }}>
          <p style={{ fontSize: 28, fontWeight: 600, color: "#FFFFFF", marginBottom: 12 }}>
            Work with us.
          </p>
          <p style={{ fontSize: 14, color: "#595C5C", marginBottom: 24 }}>
            For press, screenings, co-production, or partnership:
          </p>
          <p style={{ fontSize: 16, color: "#1ABC9C", marginBottom: 24 }}>
            press@dontskiphumanity.com
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <SecondaryBtn>Press Kit</SecondaryBtn>
            <SecondaryBtn>Contact Us</SecondaryBtn>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
