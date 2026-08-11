import { supabase } from "./supabase";
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

export async function getLandingConfig(): Promise<LandingConfig> {
  try {
    const { data, error } = await supabase
      .from("landing_page_config")
      .select("section_key, enabled, config");

    if (error || !data) return {};

    const config: LandingConfig = {};
    for (const row of data as LandingConfigRow[]) {
      config[row.section_key] = {
        enabled: row.enabled,
        text: row.config?.text ?? {},
        slotIds: row.config?.slotIds ?? [],
        slots: row.config?.slots ?? {},
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

/* ── Films page header (editable from the dashboard → Settings) ── */
export interface FilmsHeader {
  imageSrc?: string;
  titleNormal?: string;
  titleColored?: string;
  description?: string;
}

export async function getFilmsHeader(): Promise<FilmsHeader> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "films_header")
      .single();
    if (error || !data?.value) return {};
    const v = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
    return (v as FilmsHeader) ?? {};
  } catch {
    return {};
  }
}
