"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroMosaic from "@/components/HeroMosaic";
import { HERO_TILES } from "@/components/heroTiles";
import DonationSuccessDialog from "@/components/DonationSuccessDialog";
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
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#595C5C" strokeWidth={1.8}>
      <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   The project a donor arrived to fund.

   The URL carries only type + slug + title, because a URL is a bad place
   to keep an image: it makes the link unreadable and pins the poster to
   whatever it was the day the link was made. So the title is used
   immediately (it is already on screen from the URL) and the real record
   is fetched by slug for the picture and the sub-line.

   The lookup goes through /api/project rather than importing lib/api
   directly: that module reaches next/headers to pick the locale, which
   makes it server-only, and this page is a client component. The route
   still reads through lib/api, so the module's own mock/live switch is
   respected either way.
   ═══════════════════════════════════════════════════════════════ */
type FundType = "film" | "studio" | "academy";

type FundedProject = {
  image: string | null;
  meta: string | null;
  href: string;
};

function useFundedProject(
  funding: { type: FundType; slug: string } | null
): FundedProject | null {
  const [project, setProject] = useState<FundedProject | null>(null);

  const type = funding?.type ?? null;
  const slug = funding?.slug ?? null;

  useEffect(() => {
    if (!type || !slug) {
      setProject(null);
      return;
    }
    let alive = true;

    fetch(`/api/project?type=${type}&slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!alive || !j) return;
        setProject({
          image: typeof j.image === "string" ? j.image : null,
          meta: typeof j.meta === "string" ? j.meta : null,
          href: typeof j.href === "string" ? j.href : "#",
        });
      })
      .catch(() => {
        /* The card degrades to the title alone, which the URL already gave
           us. A failed lookup must not block someone from donating. */
      });

    return () => {
      alive = false;
    };
  }, [type, slug]);

  return project;
}

const IMPACT_CARDS = [
  {
    label: "FILM — MADE POSSIBLE",
    title: "Beneath the Canopy",
    sub: "847 supporters · 94 min · Sundance 2024",
    img: "/images/slider1.jpg",
    accent: "#B23495",
  },
  {
    label: "DOCUMENTARY — IN PRODUCTION",
    title: "The Archive Has No Walls",
    sub: "Currently filming · Palestine · 2025",
    img: "/images/slider2.jpg",
    accent: "#B23495",
  },
  {
    label: "WORKSHOP — SCREENED",
    title: "27 Cities, One Story",
    sub: "Community screenings · Global tour",
    img: "/images/slidere3.jpg",
    accent: "#B23495",
  },
];

const OTHER_WAYS = [
  {
    title: "Share the work",
    desc: "Amplify on social media, embed in your newsletter, or forward to someone who needs to see it.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B23495" strokeWidth={1.5}>
        <path d="M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.6 13.5l6.8 3.9M15.4 6.6L8.6 10.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Host a screening",
    desc: "Bring a DSH film to your community, university, or festival — we handle the rights.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B23495" strokeWidth={1.5}>
        <rect x="3" y="5" width="14" height="14" rx="1.5" />
        <path d="M17 9.5l4-2.5v10l-4-2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Partner with us",
    desc: "Co-production, sponsorship, or institutional collaboration. Let's build something together.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B23495" strokeWidth={1.5}>
        <path d="M11 21l-7-7a3 3 0 010-4.2l5.6-5.6a3 3 0 014.2 0L19 9.4M8 12l3 3M11 9l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/** Wrapper — useSearchParams needs a Suspense boundary above it. */
export default function SupportPage() {
  return (
    <Suspense fallback={<main className="relative bg-[#0D0D0D] min-h-screen" />}>
      <SupportPageContent />
    </Suspense>
  );
}

function SupportPageContent() {
  // "Give monthly" / "Support our work" on the landing page arrive here as
  // /support?type=monthly | one-time, so the right option is already selected.
  const params = useSearchParams();
  const initialType = params.get("type") === "one-time" ? "One-time" : "Monthly";

  /* Stripe sends the donor back here with ?status=success&session_id=cs_...
     Dismissing clears the query so a refresh doesn't reopen the dialog. */
  const [dismissedSession, setDismissedSession] = useState<string | null>(null);
  const successSession =
    params.get("status") === "success" ? params.get("session_id") : null;
  const showThanks = successSession && successSession !== dismissedSession;

  const [donationType, setDonationType] = useState<"Monthly" | "One-time">(initialType);
  const [amount, setAmount] = useState("€25");
  const [customAmount, setCustomAmount] = useState("");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  /* Warn the visitor BEFORE they enter a card if the site is in test mode.
     Without this, Stripe accepts a real card, the page says thank you, and no
     money moves — the donor believes they gave and there is no error anywhere
     to say otherwise. This banner is what makes a runtime switch acceptable. */
  const [stripeMode, setStripeMode] = useState<"test" | "live" | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/stripe/mode")
      .then((r) => r.json())
      .then((j) => alive && setStripeMode(j.mode === "live" ? "live" : "test"))
      .catch(() => {
        /* Unknown mode: say nothing rather than cry wolf on a live site. */
      });
    return () => {
      alive = false;
    };
  }, []);

  /* Arriving from a "Support this project" button on a film / studio / academy
     page. Named `fund*` rather than `type`/`slug` because `?type=` is already
     taken by the monthly-vs-one-time toggle above. The server re-validates
     these; here they only decide what the donor is told they're funding. */
  const fundType = params.get("fundType");
  const fundSlug = params.get("fundSlug");
  const fundTitle = params.get("fundTitle");
  const funding: { type: FundType; slug: string; title: string } | null =
    (fundType === "film" || fundType === "studio" || fundType === "academy") &&
    fundSlug &&
    fundTitle
      ? { type: fundType, slug: fundSlug, title: fundTitle }
      : null;

  /* Poster and sub-line for that project, fetched by slug. Null until it
     arrives (or forever, if the lookup fails) — the card still shows the
     title, which came in on the URL. */
  const fundedProject = useFundedProject(funding);

  /* The preset labels carry the € sign, so strip it before sending a number.
     `null` means "nothing valid chosen" and disables the button — better than
     letting someone click through to a checkout that will 400. */
  const selectedAmount: number | null = (() => {
    const raw = amount === "Custom" ? customAmount : amount.replace(/[^\d.]/g, "");
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  })();

  /* Amount and currency are settled server-side; this only says how much and
     which mode. Currency is deliberately not sent — the route pins it to EUR. */
  const startCheckout = async () => {
    if (selectedAmount === null || checkoutBusy) return;
    setCheckoutBusy(true);
    setCheckoutError(null);
    try {
      const r = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: donationType === "Monthly" ? "monthly" : "one_time",
          amount: selectedAmount,
          ...(funding && {
            projectType: funding.type,
            projectSlug: funding.slug,
            projectTitle: funding.title,
          }),
        }),
      });
      const j = await r.json();
      if (!r.ok || !j.url) {
        setCheckoutError(j.error ?? "Could not start checkout. Please try again.");
        return;
      }
      window.location.href = j.url;
    } catch {
      setCheckoutError("Could not reach the payment service. Please try again.");
    } finally {
      setCheckoutBusy(false);
    }
  };
  const r2 = useReveal();
  const r3 = useReveal();
  const r4 = useReveal();

  return (
    <main className="relative bg-[#0D0D0D]">
      <div className="film-grain" />
      <Navbar />

      {showThanks && successSession && (
        <DonationSuccessDialog
          sessionId={successSession}
          onClose={() => {
            setDismissedSession(successSession);
            /* Drop the query params without a navigation, so a refresh
               doesn't pop the dialog again. */
            window.history.replaceState(null, "", "/support");
          }}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
          S1 — HERO
          Built on the Studio hero construction (467:112): a drifting
          mosaic band with the copy held in a left column. The donation
          card takes the right column instead of sitting centred below
          the fold, so the first screen carries both the argument and the
          thing it is arguing for — and a funded project's card lands
          beside the amount, where it explains what the money is for.
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ paddingTop: 128 }}>
        {/* Rows alternate left / right / left. No centre panel — that block
            exists to protect a headline sitting over photos, and here the
            headline column is narrow enough not to need it. */}
        <HeroMosaic
          mode="tiles"
          tiles={HERO_TILES}
          rows={6}
          rowHeight={215}
          dim={0.66}
          falloff={260}
          panel={false}
          speed={90}
          tileFilter="grayscale(1) brightness(0.5)"
        />

        {/* Studio protects its headline with a solid rectangle behind it.
            That block is positioned for the Figma frame and would cut across
            this layout, so the same job is done with a scrim anchored to the
            reading edge: dark where the copy is, gone by the time it reaches
            the card. Without it the body copy and the bullets sit on faces
            and are genuinely hard to read. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(100deg, rgba(13,13,13,0.96) 0%, rgba(13,13,13,0.9) 32%, rgba(13,13,13,0.5) 56%, rgba(13,13,13,0.25) 100%)",
            pointerEvents: "none",
          }}
        />

        <div
          className="relative mx-auto max-w-[1224px] px-5 sm:px-8 xl:px-0"
          style={{ zIndex: 1, paddingTop: 96, paddingBottom: 110 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-x-[64px] gap-y-[56px] items-start">
            {/* ── Left: the argument ── */}
            <div className="lg:pt-[18px]">
              <p
                style={{
                  fontSize: 11,
                  lineHeight: "24px",
                  color: "#8665A7",
                  letterSpacing: "1.76px",
                  textTransform: "uppercase",
                  marginBottom: 14,
                  animation: "heroLine 900ms cubic-bezier(0.16,1,0.3,1) 100ms both",
                }}
              >
                Independent · Ad-free · Reader-supported
              </p>
              <h1
                className="font-semibold text-[38px] leading-[40px] sm:text-[50px] sm:leading-[52px]"
                style={{
                  color: "#F0F0F0",
                  letterSpacing: "-1px",
                  animation: "heroLine 900ms cubic-bezier(0.16,1,0.3,1) 300ms both",
                }}
              >
                Fund the work
                <br />
                <span
                  style={{
                    background: "linear-gradient(90deg, #32C6CC, #B23495)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  that names power.
                </span>
              </h1>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: "24px",
                  letterSpacing: "-0.08px",
                  color: "#9D9C9C",
                  maxWidth: 440,
                  marginTop: 24,
                  animation: "heroLine 900ms cubic-bezier(0.16,1,0.3,1) 500ms both",
                }}
              >
                No ads. No algorithms. No sponsors shaping what gets told. This
                work exists because people like you make it possible.
              </p>

              {/* Three plain facts, not a feature grid. Sits under the copy on
                  desktop and collapses above the card on mobile. */}
              <ul
                style={{
                  marginTop: 36,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  animation: "heroLine 900ms cubic-bezier(0.16,1,0.3,1) 700ms both",
                }}
              >
                {[
                  "Every euro funds films, free courses and fellowships.",
                  "No paywall, ever — the work stays open to everyone.",
                  "Cancel a monthly gift yourself, at any time.",
                ].map((line) => (
                  <li key={line} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span
                      aria-hidden
                      style={{
                        marginTop: 8,
                        width: 4,
                        height: 4,
                        flexShrink: 0,
                        background: "#8665A7",
                      }}
                    />
                    <span style={{ fontSize: 14, lineHeight: "22px", color: "#595C5C" }}>
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Right: the donation card ── */}
            <div
              className="relative w-full"
              style={{ animation: "heroLine 900ms cubic-bezier(0.16,1,0.3,1) 900ms both" }}
            >
          <div
            className="dsh-card-surface"
            style={{
              background: "rgba(19,19,19,0.92)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(240,240,240,0.10)",
              borderRadius: 6,
              overflow: "hidden",
              boxShadow: "0 24px 70px 0 rgba(0,0,0,0.6)",
            }}
          >
            {/* The funded project, when there is one. Poster first: someone
                who clicked "Support this project" should see the project,
                not read its name in a caption. */}
            {funding && (
              <Link
                href={fundedProject?.href ?? "#"}
                style={{ display: "block", position: "relative" }}
              >
                <div style={{ position: "relative", height: 132, background: "#131313", overflow: "hidden" }}>
                  {fundedProject?.image && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={fundedProject.image}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                  {/* Heavy enough that the eyebrow and title hold up over a
                      pale poster — the first version washed out on a bright
                      still, which is exactly the frame a film is likely to
                      lead with. */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(13,13,13,0.98) 0%, rgba(13,13,13,0.88) 45%, rgba(13,13,13,0.55) 78%, rgba(13,13,13,0.3) 100%)",
                    }}
                  />
                  <div style={{ position: "absolute", left: 22, right: 22, bottom: 14 }}>
                    <p
                      style={{
                        fontSize: 10,
                        letterSpacing: "1.6px",
                        textTransform: "uppercase",
                        color: "#8665A7",
                        marginBottom: 5,
                      }}
                    >
                      You&apos;re supporting
                    </p>
                    <p style={{ fontSize: 17, fontWeight: 600, color: "#F0F0F0", lineHeight: "22px" }}>
                      {funding.title}
                    </p>
                    {fundedProject?.meta && (
                      <p style={{ fontSize: 11, color: "#9D9C9C", marginTop: 3, textTransform: "capitalize" }}>
                        {fundedProject.meta}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )}

            {/* Type toggle */}
            <div style={{ padding: "24px 28px 0" }}>
              {/* Selected pill uses the grape-dark fill from the Studio
                  filters (PILL_ON), not an off-black tint. */}
              <div style={{ display: "flex", background: "rgba(13,13,13,0.6)", borderRadius: 3, padding: 4, border: "1px solid rgba(240,240,240,0.08)" }}>
                {(["Monthly", "One-time"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setDonationType(t)}
                    style={{
                      flex: 1,
                      padding: "11px 0",
                      fontSize: 13,
                      fontWeight: 500,
                      borderRadius: 3,
                      transition: "all 220ms cubic-bezier(0.22,1,0.36,1)",
                      background: donationType === t ? "#573377" : "transparent",
                      color: donationType === t ? "#F0F0F0" : "#595C5C",
                      border: "1px solid transparent",
                    }}
                  >
                    {t === "Monthly" && (
                      <span style={{ marginRight: 6, fontSize: 11, color: donationType === t ? "#F0F0F0" : "#595C5C" }}>↻</span>
                    )}
                    {t}
                    {t === "Monthly" && donationType === t && (
                      <span style={{ marginLeft: 8, fontSize: 10, letterSpacing: "0.08em", color: "#F0F0F0", background: "rgba(240,240,240,0.14)", padding: "1px 6px", borderRadius: 3 }}>
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
                      padding: "15px 0",
                      borderRadius: 3,
                      fontSize: 17,
                      fontWeight: 600,
                      /* Grape for the chosen amount — the same accent the rest
                         of the site uses for "this one is selected". */
                      background: amount === a ? "rgba(134,101,167,0.16)" : "rgba(27,27,27,0.4)",
                      color: amount === a ? "#F0F0F0" : "#595C5C",
                      border:
                        amount === a
                          ? "1px solid rgba(134,101,167,0.65)"
                          : "1px solid rgba(240,240,240,0.1)",
                      transition: "all 200ms",
                      position: "relative",
                    }}
                  >
                    {a}
                    {a === "€25" && donationType === "Monthly" && (
                      <span style={{ position: "absolute", top: -8, right: -6, fontSize: 9, letterSpacing: "0.06em", background: "#B23495", color: "#F0F0F0", padding: "2px 6px", borderRadius: 3 }}>
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
                  padding: "13px 16px",
                  borderRadius: 3,
                  background: amount === "Custom" ? "rgba(134,101,167,0.12)" : "rgba(27,27,27,0.4)",
                  border:
                    amount === "Custom"
                      ? "1px solid rgba(134,101,167,0.55)"
                      : "1px solid rgba(240,240,240,0.1)",
                  cursor: "text",
                  transition: "all 200ms",
                }}
              >
                <span style={{ fontSize: 15, color: amount === "Custom" ? "#F0F0F0" : "#595C5C", marginRight: 8 }}>€</span>
                <input
                  value={amount === "Custom" ? customAmount : ""}
                  onChange={(e) => {
                    setAmount("Custom");
                    setCustomAmount(e.target.value);
                  }}
                  placeholder="Custom amount"
                  className="outline-none bg-transparent flex-1"
                  style={{ fontSize: 15, color: "#F0F0F0", caretColor: "#B23495" }}
                />
              </div>
            </div>

            {/* Summary row */}
            <div
              style={{
                margin: "18px 28px 0",
                padding: "16px 18px",
                background: "rgba(13,13,13,0.55)",
                borderRadius: 3,
                border: "1px solid rgba(240,240,240,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p style={{ fontSize: 24, fontWeight: 600, color: "#F0F0F0", letterSpacing: "-0.5px" }}>
                {amount === "Custom" ? (customAmount ? `€${customAmount}` : "€—") : amount}
                <span style={{ fontSize: 13, fontWeight: 400, color: "#595C5C", marginLeft: 8 }}>
                  {donationType === "Monthly" ? "/ month" : "one-time"}
                </span>
              </p>
              {/* Where the money goes. When a project is being funded its
                  name is already the headline of the card above, so repeating
                  it here would just be noise. */}
              <p style={{ fontSize: 11, color: "#595C5C" }}>
                {funding ? "Goes to this project" : "Films · Academy · Fellows"}
              </p>
            </div>

            {/* CTA */}
            <div style={{ padding: "16px 28px 26px" }}>
              {stripeMode === "test" && (
                <div
                  role="status"
                  style={{
                    marginBottom: 14,
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: "1px solid rgba(178,52,149,0.4)",
                    background: "rgba(178,52,149,0.08)",
                  }}
                >
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#B23495" }}>
                    Test mode — no payment will be taken
                  </p>
                  <p style={{ fontSize: 11, color: "#8A8A8A", marginTop: 3 }}>
                    Donations are disabled while we finish setting up. Please
                    check back shortly.
                  </p>
                </div>
              )}
              <button
                onClick={startCheckout}
                disabled={checkoutBusy || selectedAmount === null}
                className="transition-opacity hover:opacity-90"
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: 3,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#F0F0F0",
                  border: "1px solid rgba(240,240,240,0.20)",
                  /* The brand gradient from Figma (303:567) — the same one the
                     newsletter button uses. The shared .gradient-fill-btn class
                     is still on the old #9B59B6→#1ABC9C pair, which is not a DSH
                     colour; used inline here rather than changed globally,
                     because that class is on 12 other buttons. */
                  backgroundImage:
                    "linear-gradient(95.17deg, #32C6CC 0.11%, #B23495 100.11%)",
                  cursor:
                    checkoutBusy || selectedAmount === null ? "not-allowed" : "pointer",
                  opacity: checkoutBusy || selectedAmount === null ? 0.55 : 1,
                  letterSpacing: "0.02em",
                }}
              >
                {checkoutBusy ? "Taking you to checkout…" : "Support now →"}
              </button>
              {checkoutError && (
                <p style={{ marginTop: 10, fontSize: 12, color: "#B23495", textAlign: "center" }}>
                  {checkoutError}
                </p>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <ShieldIcon />
                  <span style={{ fontSize: 11, color: "#595C5C" }}>Stripe-secured</span>
                </div>
                <span style={{ color: "#363636" }}>·</span>
                <span style={{ fontSize: 11, color: "#595C5C" }}>Cancel anytime</span>
                <span style={{ color: "#363636" }}>·</span>
                <span style={{ fontSize: 11, color: "#595C5C" }}>No fees</span>
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: "#161616" }} />

      {/* S3 — The Work You Make Possible */}
      <div style={{ padding: "80px 32px" }}>
        <div ref={r2} className="reveal" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <SectionLabel>The work you make possible</SectionLabel>
          <p style={{ fontSize: 15, color: "#9D9C9C", marginTop: 12, maxWidth: 480, lineHeight: 1.7, marginBottom: 48 }}>
            These stories exist because people decided they should.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 12, marginBottom: 12 }}>
            {[
              { num: "4,200+", label: "Free courses — forever", accent: "#B23495" },
              { num: "63", label: "Emerging voices funded", accent: "#B23495" },
              { num: "847", label: "Supporters made this film", accent: "#B23495" },
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

      <div style={{ height: 1, background: "#161616" }} />

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
          <div style={{ width: 32, height: 1, background: "rgba(178,52,149,0.6)", margin: "0 auto 28px" }} />
          <p style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.85rem)", fontStyle: "italic", color: "rgba(255,255,255,0.88)", lineHeight: 1.5, fontWeight: 300 }}>
            &ldquo;Every film, every free course, every fellow we support — these exist because someone decided
            this work matters.&rdquo;
          </p>
          <p style={{ fontSize: 13, color: "#B23495", marginTop: 24, letterSpacing: "0.12em" }}>— Don&apos;t Skip Humanity</p>
          <div style={{ width: 32, height: 1, background: "rgba(178,52,149,0.6)", margin: "28px auto 0" }} />
        </div>
      </div>

      <div style={{ height: 1, background: "#161616" }} />

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
                    background: "rgba(178,52,149,0.08)",
                    border: "1px solid rgba(178,52,149,0.15)",
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
                <button style={{ fontSize: 13, color: "#B23495", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
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
