import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { normaliseCertTemplate, certDate, type CertTemplate } from "@/lib/certificate";
import { cdnImage } from "@/lib/image-url";
import CertificatePage from "./CertificatePage";

/**
 * /certificate/<code> — the public, shareable proof of a finished course.
 *
 * Reads through academy_certificate_public (051), which returns only what is
 * printed on the certificate itself: name, course, date, code.
 */

export const dynamic = "force-dynamic";

interface PublicCert {
  code: string;
  recipient_name: string;
  issued_at: string;
  program_title: Record<string, string> | string | null;
  program_slug: string;
  template: unknown;
}

async function load(code: string): Promise<PublicCert | null> {
  if (!/^[A-Za-z0-9]{6,20}$/.test(code)) return null;
  const { data, error } = await supabase.rpc("academy_certificate_public", { p_code: code });
  if (error || !data) return null;
  return data as PublicCert;
}

function titleOf(t: PublicCert["program_title"]): string {
  if (!t) return "";
  if (typeof t === "string") return t;
  return t.pt || t.en || Object.values(t)[0] || "";
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const c = await load(code);
  if (!c) return { title: "Certificate not found — DSH" };
  const course = titleOf(c.program_title);
  return {
    title: `${c.recipient_name} completed “${course}” — DSH Academy`,
    description: `Certificate ${c.code}, issued ${certDate(c.issued_at, "en-GB")} by Don't Skip Humanity.`,
  };
}

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const c = await load(code);
  if (!c) notFound();
  const tpl: CertTemplate = normaliseCertTemplate(c.template);
  tpl.image_url = cdnImage(tpl.image_url) || tpl.image_url;
  return (
    <CertificatePage
      template={tpl}
      values={{ name: c.recipient_name, course: titleOf(c.program_title), date: certDate(c.issued_at), code: c.code }}
      issuedAt={c.issued_at}
      courseSlug={c.program_slug}
    />
  );
}
