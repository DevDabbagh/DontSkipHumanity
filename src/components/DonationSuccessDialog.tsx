"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

/* ═══════════════════════════════════════════════════════════════
   Thank-you dialog, shown when Stripe returns the donor to
   /support?status=success&session_id=cs_...

   Palette is the site's own: #0D0D0D base, the rgba(19,19,19,·)
   card chrome used on the support cards, grape #8665A7, teal
   #32C6CC and pink #B23495 for the accents. Motion is two slow
   colour blobs behind the card plus a drifting hairline — both
   killed by prefers-reduced-motion.

   Three states:
     · signed in  → thank you + the email the gift is filed under
     · guest      → thank you + optional name/email, or anonymous
     · saved      → confirmation

   The gift is already recorded before this renders; the form only
   decides whose name is on it.
   ═══════════════════════════════════════════════════════════════ */

type ProjectCard = {
  title: string;
  image: string | null;
  line: string | null;
  kind: string;
  href: string;
};

type SessionInfo = {
  paid: boolean;
  amount?: number;
  currency?: string;
  email?: string | null;
  name?: string | null;
  supportMode?: "one_time" | "monthly";
  projectTitle?: string | null;
  project?: ProjectCard | null;
};

const money = (amount?: number, currency?: string) => {
  if (amount == null) return "";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: (currency ?? "eur").toUpperCase(),
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount}`;
  }
};

const FIELD =
  "w-full rounded-[3px] border border-[rgba(240,240,240,0.14)] bg-[rgba(13,13,13,0.6)] " +
  "px-[14px] py-[13px] text-[14px] text-[#F0F0F0] placeholder:text-[#4A4D4D] " +
  "transition-colors focus:outline-none focus:border-[#8665A7]";

export default function DonationSuccessDialog({
  sessionId,
  onClose,
}: {
  sessionId: string;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<"named" | "anonymous" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(
          `/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`
        );
        const j = await r.json();
        if (!alive) return;
        setInfo(j);
        if (j.email) setEmail(j.email);
        if (j.name) setName(j.name);
      } catch {
        if (alive) setError("Could not load your payment details.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [sessionId]);

  /* Escape closes. Focus is trapped inside the card so keyboard users can't
     tab into the page behind the overlay. */
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !cardRef.current) return;
      const focusable = cardRef.current.querySelectorAll<HTMLElement>(
        'button, input, [href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    /* Stop the page behind from scrolling while the dialog is up. */
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const submit = async (anonymous: boolean) => {
    setSaving(true);
    setError(null);
    try {
      const r = await fetch("/api/donations/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, name, email, anonymous }),
      });
      const j = await r.json();
      if (!r.ok) {
        setError(j.error ?? "Could not save that.");
        return;
      }
      setSaved(anonymous ? "anonymous" : "named");
    } catch {
      setError("Could not save that.");
    } finally {
      setSaving(false);
    }
  };

  const amountLabel = money(info?.amount, info?.currency);
  const isMonthly = info?.supportMode === "monthly";
  const firstName = name.trim().split(" ")[0];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-5 py-8 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="donation-thanks-title"
    >
      {/* Scrim */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="dsh-dialog-overlay fixed inset-0 bg-[#0D0D0D]/85 backdrop-blur-[6px]"
      />

      {/* Drifting colour behind the card — the only motion in here. */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden">
        <div className="relative w-[560px] h-[560px] max-w-full">
          <div
            className="dsh-blob dsh-blob--a"
            style={{
              inset: "-18% auto auto -14%",
              width: 340,
              height: 340,
              background: "rgba(134,101,167,0.40)",
            }}
          />
          <div
            className="dsh-blob dsh-blob--b"
            style={{
              inset: "auto -16% -18% auto",
              width: 320,
              height: 320,
              background: "rgba(50,198,204,0.22)",
            }}
          />
        </div>
      </div>

      <div
        ref={cardRef}
        className="dsh-dialog-card relative w-full max-w-[540px] overflow-hidden rounded-[6px]
                   border-[1.5px] border-[rgba(240,240,240,0.12)] bg-[rgba(19,19,19,0.88)]
                   backdrop-blur-[12px]"
        style={{ boxShadow: "0 24px 70px 0 rgba(0,0,0,0.65)" }}
      >
        {/* Brand hairline */}
        <div className="dsh-sheen h-[2px] w-full" />

        <div className="px-[38px] py-[34px]">
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="absolute right-[18px] top-[20px] flex h-[28px] w-[28px] items-center
                       justify-center rounded-full text-[#595C5C] transition-colors
                       hover:bg-[rgba(240,240,240,0.06)] hover:text-[#F0F0F0]
                       focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#8665A7]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <path
                d="M1 1L11 11M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {loading ? (
            <div className="flex items-center gap-[10px] py-[10px]">
              <span className="h-[6px] w-[6px] animate-pulse rounded-full bg-[#8665A7]" />
              <p className="text-[14px] text-[#595C5C]">Confirming your payment…</p>
            </div>
          ) : !info?.paid ? (
            <>
              <h2
                id="donation-thanks-title"
                className="font-semibold text-[26px] leading-[30px] tracking-[-0.75px] text-white"
              >
                We couldn&apos;t confirm that payment.
              </h2>
              <p className="mt-[14px] font-[family-name:var(--font-source-sans)] text-[16px] leading-[24px] text-[#595C5C]">
                If you were charged, email us and we&apos;ll sort it out straight away.
              </p>
            </>
          ) : (
            <>
              {/* Amount is the hero — it's what they just did. */}
              <p className="text-[10px] uppercase tracking-[1.6px] text-[#363636]">
                {isMonthly ? "Recurring support" : "One-time support"}
              </p>

              <div className="mt-[16px] flex items-baseline gap-[10px]">
                <span className="font-semibold text-[44px] leading-[44px] tracking-[-1.2px] text-[#F0F0F0]">
                  {amountLabel}
                </span>
                {isMonthly && (
                  <span className="text-[15px] leading-[18px] text-[#595C5C]">
                    a month
                  </span>
                )}
              </div>

              {info.projectTitle && !info.project && (
                <p className="mt-[10px] text-[15px] leading-[18px] text-[#8665A7]">
                  goes to {info.projectTitle}
                </p>
              )}

              {/* The thing they backed, as a card — so the money visibly
                  lands on something rather than on a label. */}
              {info.project && (
                <a
                  href={info.project.href}
                  className="group mt-[18px] flex items-stretch gap-[14px] overflow-hidden rounded-[6px]
                             border border-[rgba(240,240,240,0.12)] bg-[rgba(13,13,13,0.55)]
                             transition-colors hover:border-[rgba(134,101,167,0.55)]"
                >
                  <div className="relative w-[76px] shrink-0 bg-[#0D0D0D]">
                    {info.project.image && (
                      <img
                        src={info.project.image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-70
                                   transition-opacity duration-500 group-hover:opacity-90"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 py-[14px] pr-[16px]">
                    <p className="text-[10px] uppercase tracking-[1.6px] text-[#8665A7]">
                      Your support goes to
                    </p>
                    <p className="mt-[5px] truncate text-[16px] font-semibold leading-[20px] text-[#F0F0F0]">
                      {info.project.title}
                    </p>
                    {info.project.line && (
                      <p className="mt-[4px] line-clamp-2 font-[family-name:var(--font-source-sans)] text-[13px] leading-[18px] text-[#7E8282]">
                        {info.project.line}
                      </p>
                    )}
                  </div>
                </a>
              )}

              <div className="my-[24px] h-px w-full bg-[rgba(240,240,240,0.08)]" />

              <h2
                id="donation-thanks-title"
                className="font-semibold text-[26px] leading-[30px] tracking-[-0.75px] text-white"
              >
                Thank you{firstName ? `, ${firstName}` : ""}.
              </h2>
              <p className="mt-[12px] font-[family-name:var(--font-source-sans)] text-[16px] leading-[24px] text-[#9D9C9C]">
                This is what keeps the work free of editorial strings.
              </p>

              {/* Signed in — nothing to ask. */}
              {user ? (
                <div className="mt-[26px] rounded-[3px] border border-[rgba(240,240,240,0.1)] bg-[rgba(13,13,13,0.5)] px-[16px] py-[14px]">
                  <p className="text-[10px] uppercase tracking-[1.6px] text-[#363636]">
                    Filed under
                  </p>
                  <p className="mt-[6px] text-[15px] leading-[18px] text-[#F0F0F0]">
                    {user.email}
                  </p>
                </div>
              ) : saved ? (
                <div className="mt-[26px] flex items-start gap-[12px] rounded-[3px] border border-[rgba(134,101,167,0.3)] bg-[rgba(134,101,167,0.08)] px-[16px] py-[14px]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    className="mt-[3px] shrink-0 text-[#8665A7]"
                    aria-hidden
                  >
                    <path
                      d="M3 8.5L6.2 11.7L13 5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                  <p className="text-[15px] leading-[20px] text-[#F0F0F0]">
                    {saved === "anonymous"
                      ? "Recorded anonymously. Thank you all the same."
                      : "Saved. If you make an account with that email, this gift will already be there."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-[26px] rounded-[3px] border border-[rgba(240,240,240,0.08)] bg-[rgba(13,13,13,0.45)] p-[18px]">
                    <p className="font-[family-name:var(--font-source-sans)] text-[14px] leading-[20px] text-[#9D9C9C]">
                      Want this kept against your name? Add your details and your
                      support follows you if you make an account later.
                    </p>

                    <div className="mt-[16px] flex flex-col gap-[10px]">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name (optional)"
                        autoComplete="name"
                        className={FIELD}
                      />
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        type="email"
                        autoComplete="email"
                        className={FIELD}
                      />
                    </div>

                    {error && (
                      <p className="mt-[10px] text-[13px] leading-[18px] text-[#B23495]">
                        {error}
                      </p>
                    )}

                    <div className="mt-[18px] flex flex-wrap items-center gap-[16px]">
                      <button
                        onClick={() => submit(false)}
                        disabled={saving}
                        className="rounded-[3px] px-[18px] py-[12px] text-[13px] font-medium
                                   text-[#F0F0F0] transition-opacity hover:opacity-90
                                   disabled:opacity-50"
                        style={{
                          backgroundImage:
                            "linear-gradient(95.35deg, #32C6CC 0%, #B23495 100%)",
                        }}
                      >
                        {saving ? "Saving…" : "Keep my details"}
                      </button>
                      <button
                        onClick={() => submit(true)}
                        disabled={saving}
                        className="rounded-[3px] border border-[rgba(240,240,240,0.2)]
                                   bg-[rgba(27,27,27,0.4)] px-[18px] py-[12px] text-[13px]
                                   font-medium text-[#9D9C9C] transition-colors
                                   hover:border-[rgba(240,240,240,0.35)] hover:text-[#F0F0F0]
                                   disabled:opacity-50"
                      >
                        Stay anonymous
                      </button>
                    </div>
                  </div>

                  <p className="mt-[14px] text-[12px] leading-[17px] text-[#363636]">
                    The donation is already complete either way. This only decides
                    whether it carries your name.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
