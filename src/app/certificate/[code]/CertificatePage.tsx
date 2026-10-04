"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CertificateActions, CertificateView } from "@/components/CertificateView";
import { useLocaleHref } from "@/contexts/LocaleContext";
import type { CertTemplate, CertValues } from "@/lib/certificate";

export default function CertificatePage({
  template,
  values,
  issuedAt,
  courseSlug,
}: {
  template: CertTemplate;
  values: CertValues;
  issuedAt: string;
  courseSlug: string;
}) {
  const href = useLocaleHref();
  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      <Navbar />
      <div className="mx-auto max-w-[1100px] px-5 pb-[120px] pt-[150px] sm:px-8">
        <div className="mb-[28px] flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-[1.76px] text-[#32C6CC]">
              <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#32C6CC] text-[11px] text-[#0D0D0D]">✓</span>
              Verified certificate
            </p>
            <h1 className="mt-[10px] text-[32px] font-semibold leading-[1.15] tracking-[-0.8px] text-[#F0F0F0] md:text-[40px]">{values.name}</h1>
            <p className="mt-[8px] font-[family-name:var(--font-source-sans)] text-[16px] text-[#9D9C9C]">
              completed{" "}
              <Link href={href(`/course/${courseSlug}`)} className="text-[#F0F0F0] underline decoration-[#363636] underline-offset-4 hover:decoration-[#32C6CC]">
                {values.course}
              </Link>{" "}
              at Don&apos;t Skip Humanity on {values.date}.
            </p>
          </div>
          <CertificateActions template={template} values={values} issuedAt={issuedAt} />
        </div>

        <CertificateView template={template} values={values} />

        <p className="mt-[18px] font-[family-name:var(--font-source-sans)] text-[13px] text-[#595C5C]">
          Certificate Nº {values.code}. This page is the proof — anyone with the link can confirm it was issued by DSH.
        </p>
      </div>
      <Footer />
    </main>
  );
}
