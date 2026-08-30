import { supabase } from "./supabase";
import { pickLang } from "./i18n";
import type { AcademyProgram } from "./types";

/**
 * Landing page CMS config, read from `landing_page_config` (public, anon-readable).
 * Edited from the admin dashboard's Landing Page Editor.
 *
 * Every field is optional by design — every landing section falls back to its own
 * hardcoded default copy/image when a field is missing, so an incomplete or empty
 * config row never breaks the page.
 */

export interface LandingSlot {
  imageSrc?: string;
  cardType?: string;
  cardTitle?: string;
  /** Multi-media slide fields (Academy Slider section) — a slide can be an image or a video. */
  mediaType?: "image" | "video";
  videoSrc?: string;
  title?: string;
  description?: string;
  badge?: string;
  isFree?: boolean;
  duration?: string;
  whoLeads?: string;
  ctaLink?: string;
}

export interface LandingSectionText {
  heading?: string;
  description?: string;
  cta?: string;
  subtitle?: string;
  meta?: string;
  personName?: string;
}

export interface LandingSection {
  enabled: boolean;
  text: LandingSectionText;
  slotIds: string[];
  slots: Record<string, LandingSlot>;
}

export type LandingConfig = Record<string, LandingSection>;

interface LandingConfigRow {
  section_key: string;
  enabled: boolean;
  config: {
    text?: LandingSectionText;
    slotIds?: string[];
    slots?: Record<string, LandingSlot>;
  } | null;
}

/* Every text field a section or a slot can carry. Anything not listed — image
   URLs, CTA destinations, flags — is passed through untouched, because a URL is
   not language-dependent. */
const SECTION_TEXT_FIELDS = ["heading", "description", "cta", "subtitle", "meta", "personName"] as const;
const SLOT_TEXT_FIELDS = ["cardType", "cardTitle", "title", "description", "badge", "duration", "whoLeads"] as const;

function resolveText<T extends object>(obj: T, fields: readonly string[], locale: string, def: string): T {
  const src = obj as Record<string, unknown>;
  const out: Record<string, unknown> = { ...src };
  for (const f of fields) {
    if (f in src) out[f] = pickLang(src[f], locale, def);
  }
  return out as T;
}

export async function getLandingConfig(): Promise<LandingConfig> {
  try {
    const { getRequestLocale } = await import("./locale-server");
    const { locale, defaultLocale } = await getRequestLocale().catch(() => ({
      locale: { code: "en" },
      defaultLocale: { code: "en" },
    }));

    const { data, error } = await supabase
      .from("landing_page_config")
      .select("section_key, enabled, config");

    if (error || !data) return {};

    const config: LandingConfig = {};
    for (const row of data as LandingConfigRow[]) {
      const slots = row.config?.slots ?? {};
      const localised: Record<string, LandingSlot> = {};
      for (const [id, slot] of Object.entries(slots)) {
        localised[id] = resolveText(slot, SLOT_TEXT_FIELDS, locale.code, defaultLocale.code);
      }

      config[row.section_key] = {
        enabled: row.enabled,
        text: resolveText(row.config?.text ?? {}, SECTION_TEXT_FIELDS, locale.code, defaultLocale.code),
        slotIds: row.config?.slotIds ?? [],
        slots: localised,
      };
    }
    return config;
  } catch {
    return {};
  }
}

/** First slot's image for single-image sections (films/studio/academy/read/newsletter). */
export function firstSlotImage(section?: LandingSection): string | undefined {
  if (!section) return undefined;
  const id = section.slotIds[0];
  return id ? section.slots[id]?.imageSrc : undefined;
}

/**
 * First slot's CTA destination — the "view more" target a section's featured
 * item points at, set per-slot from the dashboard. Returns undefined when the
 * editor hasn't linked an item yet, so the caller can render the button inert
 * instead of shipping a dead control.
 */
export function firstSlotCtaLink(section?: LandingSection): string | undefined {
  if (!section) return undefined;
  const id = section.slotIds[0];
  return id ? section.slots[id]?.ctaLink || undefined : undefined;
}

/**
 * Slide shape the Academy listing page's hero slider renders — normalized so the
 * component never has to know whether a slide came from the CMS or from live
 * Academy program data.
 */
export interface SliderSlide {
  id: string;
  mediaType: "image" | "video";
  mediaSrc: string;
  /** Poster/thumbnail shown while a video slide is inactive (video only loads + plays once it becomes the current slide). */
  poster: string;
  title: string;
  description: string;
  badge: string;
  isFree: boolean;
  duration: string;
  whoLeads: string;
  href: string;
}

/**
 * Builds the Academy listing hero slides from the `academy_slider` CMS section.
 * If the admin hasn't added any slides yet (or the section is disabled), falls
 * back to the 4 most recent live Academy programs — so the slider is never empty.
 */
export function buildAcademySlides(section: LandingSection | undefined, programs: AcademyProgram[]): SliderSlide[] {
  if (section?.enabled !== false && section?.slotIds?.length) {
    const slides = section.slotIds
      .map((id) => {
        const s = section.slots[id];
        if (!s) return null;
        const mediaType: "image" | "video" = s.mediaType === "video" ? "video" : "image";
        const mediaSrc = mediaType === "video" ? s.videoSrc ?? "" : s.imageSrc ?? "";
        if (!mediaSrc) return null;
        return {
          id,
          mediaType,
          mediaSrc,
          poster: mediaType === "video" ? (s.imageSrc || "") : mediaSrc,
          title: s.title || "",
          description: s.description || "",
          badge: s.badge || s.cardType || "",
          isFree: !!s.isFree,
          duration: s.duration || "",
          whoLeads: s.whoLeads || "",
          href: s.ctaLink || "/academy",
        };
      })
      .filter((s): s is SliderSlide => s !== null);
    if (slides.length > 0) return slides;
  }

  return programs.slice(0, 4).map((p) => ({
    id: p.id,
    mediaType: "image" as const,
    mediaSrc: p.thumbnailUrl,
    poster: p.thumbnailUrl,
    title: p.title,
    description: p.description,
    badge: p.type,
    isFree: p.isFree,
    duration: p.duration,
    whoLeads: p.whoLeads,
    href: `/course/${p.slug}`,
  }));
}

/**
 * Homepage Hero carousel slide — image or video, played only while active.
 * There's no live "programs" table to fall back to here (unlike Academy), so
 * `buildHeroSlides` returns `null` when the admin hasn't added any slides —
 * Hero.tsx keeps its own hardcoded default carousel in that case.
 */
export interface HeroSlide {
  id: string;
  mediaType: "image" | "video";
  mediaSrc: string;
  poster: string;
  type: string;
  title: string;
  href: string | null;
}

export function buildHeroSlides(section?: LandingSection): HeroSlide[] | null {
  if (!section || section.enabled === false || !section.slotIds?.length) return null;

  const slides = section.slotIds
    .map((id) => {
      const s = section.slots[id];
      if (!s) return null;
      const mediaType: "image" | "video" = s.mediaType === "video" ? "video" : "image";
      const mediaSrc = mediaType === "video" ? s.videoSrc ?? "" : s.imageSrc ?? "";
      if (!mediaSrc) return null;
      return {
        id,
        mediaType,
        mediaSrc,
        poster: mediaType === "video" ? s.imageSrc ?? "" : mediaSrc,
        type: s.cardType || "",
        title: s.cardTitle || "",
        href: s.ctaLink || null,
      };
    })
    .filter((s): s is HeroSlide => s !== null);

  return slides.length > 0 ? slides : null;
}

/* ── Films page header (editable from the dashboard → Settings) ── */
export interface FilmsHeader {
  imageSrc?: string;
  titleNormal?: string;
  titleColored?: string;
  description?: string;
}

/* ── Studio page header (editable from the dashboard → Studio → Header) ──
   The studio headline is split in three because the gradient sits in the
   middle of the sentence ("Bold, / independent media / that strengthens
   movements."), unlike the films one where it closes it. */
export interface StudioHeader {
  imageSrc?: string;
  titleNormal?: string;
  titleColored?: string;
  titleAfter?: string;
  description?: string;
}

/**
 * Read a header row in the request's language.
 *
 * Each text field may hold either a plain string (how these rows were written
 * before translations existed) or `{ en, pt, ar }`. `pickLang` accepts both, so
 * an untranslated row keeps rendering instead of going blank — and a row
 * translated into Arabic only for the headline falls back per field, not
 * per row.
 *
 * `imageSrc` is deliberately not translated: it is a URL, not language.
 */
async function readHeader<T>(
  key: string,
  textFields: readonly string[]
): Promise<T> {
  try {
    const { getRequestLocale } = await import("./locale-server");
    const { locale, defaultLocale } = await getRequestLocale().catch(() => ({
      locale: { code: "en" },
      defaultLocale: { code: "en" },
    }));

    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .single();
    if (error || !data?.value) return {} as T;

    const raw = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
    if (!raw || typeof raw !== "object") return {} as T;

    const out: Record<string, unknown> = { ...raw };
    for (const field of textFields) {
      if (field in raw) out[field] = pickLang(raw[field], locale.code, defaultLocale.code);
    }
    return out as T;
  } catch {
    return {} as T;
  }
}

/* ── Academy page header (dashboard → Settings) ──
   Three headline parts like the studio one: the Figma headline is
   "Knowledge / is power. / Education is resistance." with the second and
   third lines carrying the gradient. */
export interface AcademyHeader {
  imageSrc?: string;
  titleNormal?: string;
  titleColored?: string;
  titleAfter?: string;
  description?: string;
}

const STUDIO_HEADER_TEXT = ["titleNormal", "titleColored", "titleAfter", "description"] as const;
const FILMS_HEADER_TEXT = ["titleNormal", "titleColored", "description"] as const;
const ACADEMY_HEADER_TEXT = STUDIO_HEADER_TEXT;

export async function getStudioHeader(): Promise<StudioHeader> {
  return readHeader<StudioHeader>("studio_header", STUDIO_HEADER_TEXT);
}

export async function getFilmsHeader(): Promise<FilmsHeader> {
  return readHeader<FilmsHeader>("films_header", FILMS_HEADER_TEXT);
}

export async function getAcademyHeader(): Promise<AcademyHeader> {
  return readHeader<AcademyHeader>("academy_header", ACADEMY_HEADER_TEXT);
}
