"use client";

import { useReveal } from "@/hooks/useReveal";
import SecondaryBtn from "@/components/SecondaryBtn";

const WHAT_WE_DO = [
  {
    num: "01",
    title: "Films",
    desc: "Feature and short documentaries exploring injustice, dignity, and resistance — distributed globally and screened in communities.",
    link: "Explore Films",
  },
  {
    num: "02",
    title: "Journalism",
    desc: "Investigative reporting and essays that centre the people most affected by power — not the institutions that wield it.",
    link: "Read our work",
  },
  {
    num: "03",
    title: "Education",
    desc: "A free Academy offering courses, toolkits, and fellowships for journalists and filmmakers at the grassroots level.",
    link: "Visit Academy",
  },
];

const IMPACT_PILLARS = [
  { num: "01", name: "Storytelling for justice", desc: "Films and journalism that reframe dominant narratives and amplify suppressed voices." },
  { num: "02", name: "Learning to organise", desc: "Educational programs that build technical and conceptual capacity at the grassroots level." },
  { num: "03", name: "Movement support", desc: "Direct collaboration with activists, organizers, and communities in resistance." },
  { num: "04", name: "Care as practice", desc: "Refusing extractive models — building media work that sustains contributors and communities alike." },
  { num: "05", name: "Action and amplification", desc: "Distribution strategies designed to reach the people who need the work, not just those who can pay for it." },
];

const TEAM = [
  { name: "Rasha Salti", role: "Film Director", bio: "Documentary, fiction, and archival work.", img: "/images/team-female.jpg" },
  { name: "Tanya Habjouqa", role: "Visual Journalist", bio: "Photography across the Middle East.", img: "/images/team-female.jpg" },
  { name: "Kamal Aljafari", role: "Filmmaker", bio: "Experimental documentary and film.", img: "/images/team-male.jpg" },
  { name: "Omar Shargawi", role: "Cinematographer", bio: "Camera and light for documentary work.", img: "/images/team-male.jpg" },
];

function SectionLabel({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <p
      className={`text-[10px] uppercase font-medium ${center ? "text-center" : ""}`}
      style={{ color: "rgba(54,54,54,0.8)", letterSpacing: "0.3em" }}
    >
      {children}
    </p>
  );
}

export default function AboutSections() {
  const r1 = useReveal();
  const r2 = useReveal();
  const r3 = useReveal();
  const r4 = useReveal();

  return (
    <>
      {/* S2 — What We Do */}
      <div className="max-w-[1400px] mx-auto px-8" style={{ padding: "64px 32px" }}>
        <div ref={r1} className="reveal">
          <SectionLabel center>What we do</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 mt-12" style={{ gap: 0 }}>
            {WHAT_WE_DO.map((col, i) => (
              <div
                key={col.num}
                className={`reveal stagger-${i + 1} text-center`}
                style={{
                  padding: "0 40px",
                  borderRight: i < 2 ? "1px solid rgba(255,255,255,0.05)" : undefined,
                }}
              >
                <p className="gradient-text" style={{ fontSize: 40, fontWeight: 700, marginBottom: 16 }}>
                  {col.num}
                </p>
                <p style={{ fontSize: 20, fontWeight: 600, color: "#FFFFFF", marginBottom: 12 }}>{col.title}</p>
                <p style={{ fontSize: 14, color: "#595C5C", lineHeight: 1.625, marginBottom: 16 }}>{col.desc}</p>
                <button className="text-[14px] transition-colors hover:underline" style={{ color: "#1ABC9C" }}>
                  {col.link} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* S3 — Identity */}
      <div className="max-w-[1400px] mx-auto px-8" style={{ paddingBottom: 64 }}>
        <div
          ref={r2}
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: 48, alignItems: "center" }}
        >
          <div
            className="reveal-left"
            style={{
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
              position: "relative",
              isolation: "isolate",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/infocus.jpg"
              alt="People in resistance"
              className="w-full"
              style={{ display: "block", filter: "grayscale(1) brightness(0.65) contrast(1.1)" }}
            />
          </div>
          <div className="reveal-right stagger-2">
            <h2 style={{ fontSize: 36, fontWeight: 600, color: "#FFFFFF", lineHeight: 1.2, marginBottom: 24 }}>
              A <span className="gradient-text">transnational</span>
              <br />
              media company.
            </h2>
            <p style={{ fontSize: 14, color: "#595C5C", lineHeight: 1.625, marginBottom: 16 }}>
              Founded in Lisbon, DSH operates across borders — with contributors, partners, and communities in
              Europe, Africa, and the Middle East.
            </p>
            <div style={{ borderLeft: "3px solid #9B59B6", paddingLeft: 20, margin: "24px 0" }}>
              <p style={{ fontSize: 16, fontStyle: "italic", color: "#F0F0F0" }}>
                &quot;We believe independent media is not a service. It is a political act.&quot;
              </p>
            </div>
            <p style={{ fontSize: 14, color: "#595C5C", lineHeight: 1.625, marginBottom: 16 }}>
              We refuse the neutrality myth. Every editorial decision is a values decision — and ours are rooted in
              human dignity, care as infrastructure, and the right to tell your own story.
            </p>
            <p style={{ fontSize: 14, color: "#595C5C", lineHeight: 1.625 }}>
              DSH is reader-funded, advertiser-free, and runs its Academy on an entirely free model — because
              access to media education is not a privilege.
            </p>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "#161616" }} />

      {/* S4 — Impact Pillars */}
      <div className="max-w-[1400px] mx-auto px-8" style={{ padding: "64px 32px" }}>
        <div ref={r3} className="reveal">
          <SectionLabel>Impact</SectionLabel>
          <h2 style={{ fontSize: 36, fontWeight: 600, marginTop: 12, marginBottom: 48 }}>
            <span style={{ color: "#FFFFFF" }}>Impact is not a metric.</span>
            <br />
            <span style={{ color: "#1ABC9C" }}>It is the space between the work and the world.</span>
          </h2>
          {IMPACT_PILLARS.map((pillar, i) => (
            <div
              key={pillar.num}
              className={`reveal stagger-${Math.min(i + 1, 5)} flex items-center transition-colors hover:bg-white/[0.02]`}
              style={{ padding: "24px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <p className="gradient-text flex-shrink-0" style={{ fontSize: 28, fontWeight: 700, width: 60 }}>
                {pillar.num}
              </p>
              <p style={{ fontSize: 22, fontWeight: 600, color: "#FFFFFF", width: 280, flexShrink: 0 }}>
                {pillar.name}
              </p>
              <p style={{ fontSize: 14, color: "#595C5C", lineHeight: 1.625, flex: 1 }}>{pillar.desc}</p>
            </div>
          ))}
          <div style={{ marginTop: 32 }}>
            <SecondaryBtn>View full impact report →</SecondaryBtn>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "#161616" }} />

      {/* S5 — Team Grid */}
      <div className="max-w-[1400px] mx-auto px-8" style={{ padding: "64px 32px" }}>
        <div ref={r4} className="reveal">
          <SectionLabel>Team</SectionLabel>
          <h2 style={{ fontSize: 36, fontWeight: 600, color: "#FFFFFF", marginTop: 12, marginBottom: 48 }}>
            The people behind the work.
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {TEAM.map((member, i) => (
              <div key={member.name} className={`reveal-scale stagger-${Math.min(i + 1, 5)} text-center`}>
                <div
                  className="mx-auto mb-4 group"
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.08)",
                    position: "relative",
                    isolation: "isolate",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover transition-all duration-500 grayscale brightness-[0.8] group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-[1.06]"
                  />
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#F0F0F0" }}>{member.name}</p>
                <p style={{ fontSize: 13, color: "#1ABC9C", marginTop: 4 }}>{member.role}</p>
                <p style={{ fontSize: 12, color: "#999999", marginTop: 4 }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
