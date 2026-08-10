import { supabase } from "./supabase";

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
