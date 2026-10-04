"use client";

import { useState } from "react";
import type { CertFieldKey, CertTemplate, CertValues } from "@/lib/certificate";
import { SERIF, certText, renderCertificatePng } from "@/lib/certificate";

/**
 * A certificate on screen — the design image with the learner's details laid
 * over it exactly where the editor placed them (font sizes in container-width
 * units, so it scales with the card). The download uses the same numbers on a
 * full-resolution canvas.
 */

const KEYS: CertFieldKey[] = ["name", "course", "date", "code"];
const SANS = "var(--font-inter), Inter, system-ui, sans-serif";

export function CertificateView({ template, values }: { template: CertTemplate; values: CertValues }) {
  const ratio = template.image_url && template.width && template.height ? template.width / template.height : 1.414;

  if (!template.image_url) {
    // No design uploaded: a clean, dignified fallback.
    return (
      <div
        className="relative w-full overflow-hidden rounded-[6px] bg-[#FBFAF7] text-[#1A1A1A] shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
        style={{ aspectRatio: `${ratio}`, containerType: "inline-size" }}
      >
        <div className="absolute inset-[4%_4%] border-[0.4cqw] border-[#B23495]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-[1.6cqw] px-[8%] text-center">
          <p style={{ fontSize: "1.6cqw", letterSpacing: "0.3cqw" }} className="font-semibold uppercase">
            Certificate of completion · Don&apos;t Skip Humanity
          </p>
          <p style={{ fontSize: "5.2cqw", fontFamily: SERIF }} className="font-bold leading-tight">{values.name}</p>
          <p style={{ fontSize: "2cqw" }} className="font-semibold">{values.course}</p>
          <p style={{ fontSize: "1.4cqw" }} className="opacity-70">
            {values.date} · Nº {values.code}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-[6px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
      style={{ aspectRatio: `${ratio}`, containerType: "inline-size" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={template.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
      {KEYS.filter((k) => template.fields[k].enabled).map((k) => {
        const f = template.fields[k];
        return (
          <span
            key={k}
            className="absolute whitespace-nowrap leading-none"
            style={{
              left: `${f.x * 100}%`,
              top: `${f.y * 100}%`,
              transform: `translate(${f.align === "center" ? "-50%" : f.align === "right" ? "-100%" : "0"}, -50%)`,
              fontSize: `${f.size * 100}cqw`,
              color: f.color,
              fontWeight: f.weight,
              fontFamily: f.font === "serif" ? SERIF : SANS,
              maxWidth: "86%",
            }}
          >
            {certText(k, values)}
          </span>
        );
      })}
    </div>
  );
}

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");

/** Download as PNG, share the public page, add to LinkedIn. */
export function CertificateActions({
  template,
  values,
  issuedAt,
}: {
  template: CertTemplate;
  values: CertValues;
  issuedAt: string;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const pageUrl = `${SITE || (typeof window !== "undefined" ? window.location.origin : "")}/certificate/${values.code}`;

  const download = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const sans = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
      const blob = await renderCertificatePng(template, values, sans);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DSH-certificate-${values.code}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Couldn't create the download.");
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    setMsg(null);
    const data = { title: `${values.name} — ${values.course}`, text: `I completed “${values.course}” at Don't Skip Humanity.`, url: pageUrl };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(pageUrl);
        setMsg("Link copied.");
      }
    } catch {
      /* the share sheet was closed — nothing to do */
    }
  };

  const d = new Date(issuedAt);
  const linkedIn =
    "https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME" +
    `&name=${encodeURIComponent(values.course)}` +
    `&organizationName=${encodeURIComponent("Don't Skip Humanity")}` +
    `&issueYear=${d.getFullYear()}&issueMonth=${d.getMonth() + 1}` +
    `&certUrl=${encodeURIComponent(pageUrl)}&certId=${encodeURIComponent(values.code)}`;

  const btn = "flex items-center justify-center gap-[7px] rounded-[3px] px-[16px] py-[11px] text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-50";

  return (
    <div className="flex flex-col gap-[10px]">
      <div className="flex flex-wrap gap-[10px]">
        <button type="button" onClick={download} disabled={busy} className={`${btn} text-white`} style={{ background: "linear-gradient(90deg,#32C6CC,#B23495)" }}>
          {busy ? "Preparing…" : "Download PNG"}
        </button>
        <button type="button" onClick={share} className={`${btn} border border-[#363636] text-[#F0F0F0]`}>
          Share
        </button>
        <a href={linkedIn} target="_blank" rel="noopener noreferrer" className={`${btn} border border-[#363636] text-[#F0F0F0]`}>
          Add to LinkedIn
        </a>
      </div>
      {msg && <p className="text-[12px] text-[#9D9C9C]">{msg}</p>}
    </div>
  );
}
