import { cache } from "react";
import { supabase } from "./supabase";
import { getLocales } from "./i18n";

/**
 * Editable page sections — the reading half of migration 026.
 *
 * The dashboard writes an ordered list of typed sections per page; this reads
 * them back for the request's language and hands the renderer plain strings.
 *
 * WHY THE LANGUAGE IS RESOLVED HERE AND NOT IN THE COMPONENT
 *
 * The About page's sections are rendered by a client component (they animate
 * on scroll). A client component cannot call `headers()`, so it cannot know
 * the request's locale without a second round-trip. Resolving on the server
 * means the browser receives finished text — one language, no fallback logic
 * shipped to the client, and no flash of the wrong language.
 *
 * WHY THERE IS A HARD-CODED FALLBACK
 *
 * A page that renders empty looks exactly like a page an editor emptied. If
 * the table is unreachable, or the migration has not been applied to this
 * environment, About still renders its copy. Silence is not an acceptable
 * failure mode for the company's own description.
 */

export type SectionKind =
  | "hero"
  | "intro"
  | "numbered_list"
  | "split_prose"
  | "pillars"
  | "people"
  | "cta"
  /* Support's shapes: a row of figures, a row of project cards, a big quote. */
  | "stats"
  | "cards"
  | "quote";

/** A section after translation: every text value is already a plain string. */
export interface ResolvedSection {
  id: string;
  kind: SectionKind;
  content: Record<string, unknown>;
}

interface Row {
  id: string;
  kind: string;
  position: number;
  enabled: boolean;
  content: Record<string, unknown> | null;
}

/* ── Translating the content tree ─────────────────────────────────────
   Text inside `content` is `{ "en": "…", "ar": "…" }`; images and links are
   plain strings; repeaters are arrays of objects mixing both. So the resolver
   walks the tree rather than naming fields — the schema lives in the dashboard
   and this reader must not need updating every time a field is added there. */

/**
 * Is this object a translation map rather than a real object?
 *
 * The test is: every value is a string AND at least one key is a language we
 * actually publish in. A repeater item (`{ num, title, desc, linkHref }`) has
 * string values too, which is why the language check is what separates them —
 * no content field is ever named "en" or "ar".
 *
 * "At least one" rather than "all", so a leftover key from a language that was
 * later disabled doesn't stop the whole field from being translated.
 */
function isLangMap(value: Record<string, unknown>, codes: Set<string>): boolean {
  const entries = Object.entries(value);
  if (entries.length === 0) return false;
  if (!entries.every(([, v]) => typeof v === "string")) return false;
  return entries.some(([k]) => codes.has(k));
}

/**
 * Walk a content tree and replace every translation map with its text.
 *
 * Exported because it is the whole of the translation behaviour and is worth
 * testing on its own — and because the next page built on `page_sections`
 * needs exactly this and should not write a second copy of it.
 */
export function resolveTranslations(
  value: unknown,
  locale: string,
  fallback: string,
  codes: Set<string>
): unknown {
  if (Array.isArray(value)) {
    return value.map((v) => resolveTranslations(v, locale, fallback, codes));
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (isLangMap(obj, codes)) {
      /* The same order as `pickLang`: asked → default → any language that has
         text. A visitor reading Arabic sees English rather than a gap while a
         translation is still being written. */
      const asked = (obj[locale] as string)?.trim();
      if (asked) return asked;
      const def = (obj[fallback] as string)?.trim();
      if (def) return def;
      return (Object.values(obj) as string[]).find((v) => v?.trim()) ?? "";
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = resolveTranslations(v, locale, fallback, codes);
    }
    return out;
  }
  return value;
}

/**
 * Read one page's visible sections, in order, in the request's language.
 *
 * Wrapped in React's `cache` so the page body and `generateMetadata` — which
 * both need the hero — share one query per request instead of two.
 */
export const getPageSections = cache(async function getPageSections(
  page: "about" | "support"
): Promise<ResolvedSection[]> {
  let locale = "en";
  let fallback = "en";
  let codes = new Set<string>(["en"]);

  try {
    const { getRequestLocale } = await import("./locale-server");
    const resolved = await getRequestLocale();
    locale = resolved.locale.code;
    fallback = resolved.defaultLocale.code;
    codes = new Set(resolved.locales.map((l) => l.code));
  } catch {
    /* Rendered outside a request (a build-time pass, a test) — English it is. */
    try {
      codes = new Set((await getLocales()).map((l) => l.code));
    } catch {
      /* keep the single-locale default */
    }
  }

  let rows: Row[] = [];
  try {
    const { data, error } = await supabase
      .from("page_sections")
      .select("id, kind, position, enabled, content")
      .eq("page", page)
      .eq("enabled", true)
      .order("position", { ascending: true });
    if (!error && data) rows = data as Row[];
  } catch {
    /* fall through to the defaults below */
  }

  if (rows.length === 0) {
    rows = (DEFAULTS[page] ?? []).map((s, i) => ({
      id: `default-${page}-${i}`,
      kind: s.kind,
      position: i,
      enabled: true,
      content: s.content,
    }));
  }

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind as SectionKind,
    content: resolveTranslations(row.content ?? {}, locale, fallback, codes) as Record<
      string,
      unknown
    >,
  }));
});

/** Pull one section out by kind — pages render specific slots (hero, cta). */
export function sectionOfKind(
  sections: ResolvedSection[],
  kind: SectionKind
): ResolvedSection | undefined {
  return sections.find((s) => s.kind === kind);
}

/* ── The floor ────────────────────────────────────────────────────────
   The English copy of the About page, matching migration 026 + 028. Used only
   when the table gives back nothing at all. Kept deliberately terse: this is a
   safety net, not a second place to edit copy. */

const DEFAULTS: Record<string, { kind: SectionKind; content: Record<string, unknown> }[]> = {
  about: [
    {
      kind: "hero",
      content: {
        eyebrow: "",
        headline: "We don't look away.",
        standfirst:
          "Don't Skip Humanity is an independent media company creating films, journalism, and educational projects rooted in dignity, witness, and collective liberation.",
        imageSrc: "",
      },
    },
    {
      kind: "numbered_list",
      content: {
        label: "What we do",
        items: [
          {
            num: "01",
            title: "Films",
            desc: "Feature and short documentaries exploring injustice, dignity, and resistance — distributed globally and screened in communities.",
            linkLabel: "Explore Films",
            linkHref: "/films",
          },
          {
            num: "02",
            title: "Journalism",
            desc: "Investigative reporting and essays that centre the people most affected by power — not the institutions that wield it.",
            linkLabel: "Read our work",
            linkHref: "/read",
          },
          {
            num: "03",
            title: "Education",
            desc: "A free Academy offering courses, toolkits, and fellowships for journalists and filmmakers at the grassroots level.",
            linkLabel: "Visit Academy",
            linkHref: "/academy",
          },
        ],
      },
    },
    {
      kind: "split_prose",
      content: {
        headlineNormal: "A",
        headlineAccent: "transnational",
        headlineAfter: "media company.",
        imageSrc: "/images/infocus.jpg",
        paragraphs: [
          "Founded in Lisbon, DSH operates across borders — with contributors, partners, and communities in Europe, Africa, and the Middle East.",
          "We refuse the neutrality myth. Every editorial decision is a values decision — and ours are rooted in human dignity, care as infrastructure, and the right to tell your own story.",
          "DSH is reader-funded, advertiser-free, and runs its Academy on an entirely free model — because access to media education is not a privilege.",
        ],
        quote: "We believe independent media is not a service. It is a political act.",
      },
    },
    {
      kind: "pillars",
      content: {
        label: "Impact",
        headlineNormal: "Impact is not a metric.",
        headlineAccent: "It is the space between the work and the world.",
        ctaLabel: "View full impact report →",
        ctaHref: "",
        items: [
          { num: "01", name: "Storytelling for justice", desc: "Films and journalism that reframe dominant narratives and amplify suppressed voices." },
          { num: "02", name: "Learning to organise", desc: "Educational programs that build technical and conceptual capacity at the grassroots level." },
          { num: "03", name: "Movement support", desc: "Direct collaboration with activists, organizers, and communities in resistance." },
          { num: "04", name: "Care as practice", desc: "Refusing extractive models — building media work that sustains contributors and communities alike." },
          { num: "05", name: "Action and amplification", desc: "Distribution strategies designed to reach the people who need the work, not just those who can pay for it." },
        ],
      },
    },
    {
      kind: "people",
      content: {
        label: "Team",
        headline: "The people behind the work.",
        items: [
          { name: "Rasha Salti", role: "Film Director", bio: "Documentary, fiction, and archival work.", imageSrc: "/images/team-female.jpg" },
          { name: "Tanya Habjouqa", role: "Visual Journalist", bio: "Photography across the Middle East.", imageSrc: "/images/team-female.jpg" },
          { name: "Kamal Aljafari", role: "Filmmaker", bio: "Experimental documentary and film.", imageSrc: "/images/team-male.jpg" },
          { name: "Omar Shargawi", role: "Cinematographer", bio: "Camera and light for documentary work.", imageSrc: "/images/team-male.jpg" },
        ],
      },
    },
    {
      kind: "cta",
      content: {
        heading: "Work with us.",
        body: "For press, screenings, co-production, or partnership:",
        email: "press@dontskiphumanity.com",
        buttons: [
          { label: "Press Kit", href: "" },
          { label: "Contact Us", href: "/support" },
        ],
      },
    },
  ],
};
