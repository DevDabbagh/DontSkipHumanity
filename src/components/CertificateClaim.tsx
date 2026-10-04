"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLocaleHref } from "@/contexts/LocaleContext";
import type { AcademyProgram } from "@/lib/types";
import { certDate, normaliseCertTemplate } from "@/lib/certificate";
import { CertificateActions, CertificateView } from "./CertificateView";

/**
 * Where a learner receives their certificate.
 *
 * Certificates go to signed-in learners only: the server issues one after
 * checking — from the learner's own saved progress — that every lesson that
 * counts is complete. Nothing here can mint a certificate on its own.
 */

interface CertRow {
  code: string;
  recipient_name: string;
  issued_at: string;
}

export default function CertificateClaim({ program, remaining }: { program: AcademyProgram; remaining: number }) {
  const { user, profile } = useAuth();
  const href = useLocaleHref();
  const [cert, setCert] = useState<CertRow | null>(null);
  const [checked, setChecked] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const template = normaliseCertTemplate(program.certificateTemplate);

  // An existing certificate for this course, if the learner already has one.
  useEffect(() => {
    if (!user || !program.id) return;
    let live = true;
    supabase
      .from("academy_certificates")
      .select("code, recipient_name, issued_at")
      .eq("program_id", program.id)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!live) return;
        setCert((data as CertRow | null) ?? null);
        setChecked(true);
      });
    return () => {
      live = false;
    };
  }, [user, program.id]);

  const shownName = name || profile?.fullName || "";

  const claim = async () => {
    if (!program.id) return;
    setBusy(true);
    setError(null);
    const { data, error: e } = await supabase.rpc("academy_issue_certificate", { p_program_id: program.id, p_name: shownName.trim() || null });
    setBusy(false);
    if (e) {
      const m = e.message;
      setError(
        m.includes("incomplete")
          ? `Almost there — ${m.replace(/^.*incomplete:\s*/, "")}. Make sure each lesson is marked complete.`
          : m.includes("certificate_not_enabled")
            ? "This course doesn't give a certificate."
            : "Something went wrong issuing your certificate. Try again."
      );
      return;
    }
    setCert(data as CertRow);
  };

  const box = "flex flex-col gap-[16px]";
  const text = "font-[family-name:var(--font-source-sans)] text-[14px] leading-[22px] text-[#9D9C9C]";

  if (!program.certificateEnabled) {
    return <p className={text}>This course doesn&apos;t give a certificate.</p>;
  }

  if (!user) {
    return (
      <div className={box}>
        <p className={text}>
          Certificates are for signed-in learners. Sign in (or create a free account) to save your progress — your certificate appears here when you finish.
        </p>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("dsh:open-login"))}
          className="w-fit rounded-[3px] px-[18px] py-[11px] text-[13px] font-medium text-white"
          style={{ background: "linear-gradient(90deg,#32C6CC,#B23495)" }}
        >
          Sign in to get your certificate
        </button>
      </div>
    );
  }

  if (cert) {
    const values = {
      name: cert.recipient_name,
      course: program.title,
      date: certDate(cert.issued_at),
      code: cert.code,
    };
    return (
      <div className={box}>
        <p className="text-[13px] font-medium text-[#32C6CC]">Course complete — this is yours.</p>
        <CertificateView template={template} values={values} />
        <CertificateActions template={template} values={values} issuedAt={cert.issued_at} />
        <Link href={href(`/certificate/${cert.code}`)} className="w-fit text-[12px] text-[#9D9C9C] underline hover:text-[#F0F0F0]">
          Open the certificate page — anyone with the link can verify it
        </Link>
      </div>
    );
  }

  if (!checked) return <p className={text}>…</p>;

  if (remaining > 0) {
    return (
      <p className={text}>
        {remaining} lesson{remaining === 1 ? "" : "s"} left before your certificate. Mark each one complete as you go — your progress is saved to your account.
      </p>
    );
  }

  return (
    <div className={box}>
      <p className={text}>You&apos;ve completed every lesson. Check how your name should appear, then get your certificate.</p>
      <label className="flex flex-col gap-[6px]">
        <span className="text-[11px] uppercase tracking-[1.76px] text-[#595C5C]">Name on the certificate</span>
        <input
          value={shownName}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          className="rounded-[3px] border border-[#2A2A2A] bg-[#141414] px-[14px] py-[11px] text-[15px] text-[#F0F0F0] outline-none focus:border-[#32C6CC]"
        />
      </label>
      <button
        type="button"
        onClick={claim}
        disabled={busy || !shownName.trim()}
        className="w-fit rounded-[3px] px-[18px] py-[11px] text-[13px] font-medium text-white disabled:opacity-50"
        style={{ background: "linear-gradient(90deg,#32C6CC,#B23495)" }}
      >
        {busy ? "Issuing…" : "Get my certificate"}
      </button>
      {error && <p className="text-[13px] text-[#FF7A6E]">{error}</p>}
    </div>
  );
}
