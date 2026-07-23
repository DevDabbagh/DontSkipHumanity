/**
 * Map Supabase snake_case rows → landing page camelCase types.
 * Read-only — no toSnake functions needed for the public site.
 */

import type {
  Film, FilmFestival, FilmScreening, FilmStage, FilmForm, FilmFormat,
  StudioProject, StudioFormat, StudioStatus,
  AcademyProgram, AcademyType, AcademyFormat,
  Article, ArticleBlock, ArticleAuthor, ArticleStatus,
  DSHEvent, EventPartner, EventStatus,
} from "./types";

// ── Helper ─────────────────────────────────────────────────────

function str(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null) {
    // multilang JSONB — return first non-empty value
    const vals = Object.values(v as Record<string, string>);
    return vals.find((s) => s?.trim()) || fallback;
  }
  return fallback;
}

// ── Films ──────────────────────────────────────────────────────

export function mapFilm(row: any): Film {
  return {
    id: row.id,
    title: str(row.title),
    slug: row.slug || "",
    logline: str(row.logline),
    synopsisShort: str(row.synopsis_short),
    synopsisLong: str(row.synopsis_long),
    editorialContext: str(row.editorial_context),
    credits: {
      direction: row.credit_direction || "",
      production: row.credit_production || "",
      coProduction: row.credit_co_production || "",
      year: row.credit_year || "",
      duration: row.credit_duration || "",
      form: (row.form || "documentary") as FilmForm,
      format: (row.format || "feature") as FilmFormat,
      language: row.credit_language || "",
      country: row.credit_country || "",
    },
    stage: (row.stage || "development") as FilmStage,
    themes: Array.isArray(row.themes) ? row.themes : [],
    trailerUrl: row.trailer_url || "",
    thumbnailUrl: row.thumbnail_url || "",
    posterUrl: row.poster_url || "",
    festivals: Array.isArray(row.film_festivals)
      ? row.film_festivals.map((f: any): FilmFestival => ({
          name: f.name || "",
          year: f.year || "",
          award: f.award || undefined,
          selection: f.selection || undefined,
        }))
      : [],
    pressQuotes: Array.isArray(row.film_press_quotes)
      ? row.film_press_quotes.map((q: any) => ({
          source: q.source || "",
          quote: q.quote || "",
        }))
      : [],
    screenings: Array.isArray(row.film_screenings)
      ? row.film_screenings.map((s: any): FilmScreening => ({
          event: s.event || "",
          date: s.date || "",
          location: s.location || "",
          type: s.type || "festival",
        }))
      : [],
    accessMode: row.access_mode || "public",
    status: row.status || "draft",
    isFeatured: row.is_featured || false,
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

// ── Studio ─────────────────────────────────────────────────────

export function mapStudioProject(row: any): StudioProject {
  return {
    id: row.id,
    title: str(row.title),
    slug: row.slug || "",
    format: (row.format || "other") as StudioFormat,
    oneLineDescription: str(row.description),
    synopsisShort: str(row.synopsis_short),
    synopsisLong: str(row.synopsis_long),
    episodes: Array.isArray(row.studio_episodes)
      ? row.studio_episodes.map((e: any) => ({
          title: str(e.title),
          description: str(e.description),
          duration: e.duration || undefined,
        }))
      : [],
    credits: {
      production: row.credit_production || "",
      coProduction: row.credit_co_production || "",
      hosts: row.credit_hosts_creators
        ? row.credit_hosts_creators.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],
      partners: row.credit_partners
        ? row.credit_partners.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],
      year: row.credit_year || "",
      language: row.credit_language || "",
    },
    status: (row.studio_status || "upcoming") as StudioStatus,
    editorialContext: str(row.editorial_context),
    listenLinks: Array.isArray(row.studio_platform_links)
      ? row.studio_platform_links.map((p: any) => ({
          platform: p.platform || "",
          url: p.url || "",
        }))
      : [],
    relatedFilmIds: Array.isArray(row.related_film_ids) ? row.related_film_ids : [],
    relatedArticleIds: Array.isArray(row.related_article_ids) ? row.related_article_ids : [],
    relatedCampaignIds: [],
    thumbnailUrl: row.thumbnail_url || "",
    coverUrl: row.cover_url || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

// ── Academy ────────────────────────────────────────────────────

export function mapAcademyProgram(row: any): AcademyProgram {
  return {
    id: row.id,
    title: str(row.title),
    slug: row.slug || "",
    type: (row.type || "course") as AcademyType,
    format: (row.format || "online") as AcademyFormat,
    description: str(row.description),
    objectives: Array.isArray(row.objectives) ? row.objectives : [],
    whoLeads: str(row.who_leads),
    whoItsFor: str(row.who_its_for),
    duration: row.duration || "",
    isFree: row.is_free ?? true,
    price: row.price ?? null,
    scholarshipNote: str(row.scholarship_note),
    dates: row.dates || "",
    howToJoin: str(row.how_to_join),
    thumbnailUrl: row.thumbnail_url || "",
    resources: Array.isArray(row.academy_resources)
      ? row.academy_resources.map((r: any) => ({
          id: r.id,
          title: r.title || "",
          type: r.type || "link",
          url: r.url || "",
        }))
      : [],
    relatedFilmIds: Array.isArray(row.related_film_ids) ? row.related_film_ids : [],
    relatedStudioIds: Array.isArray(row.related_studio_ids) ? row.related_studio_ids : [],
    enrolledCount: row.enrolled_count || 0,
    completionRate: row.completion_rate || 0,
    status: row.status || "draft",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

// ── Articles ───────────────────────────────────────────────────

export function mapArticle(row: any): Article {
  return {
    id: row.id,
    title: str(row.title),
    slug: row.slug || "",
    tag: row.tag || "",
    excerpt: str(row.excerpt),
    date: row.date || "",
    body: Array.isArray(row.body) ? (row.body as ArticleBlock[]) : [],
    mainImage: row.main_image || "",
    mainImageCaption: row.main_image_caption || "",
    mainImageCredit: row.main_image_credit || "",
    author: (row.author as ArticleAuthor) || { name: "", avatar: "" },
    gallery: Array.isArray(row.gallery)
      ? row.gallery.map((g: any) => ({
          id: g.id || "",
          url: g.url || "",
          caption: g.caption || "",
          credit: g.credit || "",
        }))
      : [],
    status: (row.status || "draft") as ArticleStatus,
    scheduledDate: row.scheduled_date || null,
    seo: {
      metaDescription: row.seo_meta_description || "",
      socialShareImage: row.seo_social_share_image || "",
    },
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

// ── Events ─────────────────────────────────────────────────────

export function mapEvent(row: any): DSHEvent {
  return {
    id: row.id,
    title: str(row.title),
    slug: row.slug || "",
    tag: row.tag || "",
    excerpt: str(row.excerpt),
    description: str(row.description),
    startDate: row.start_date || "",
    endDate: row.end_date || "",
    mainImage: row.main_image || "",
    partners: Array.isArray(row.event_partners)
      ? row.event_partners.map((p: any): EventPartner => ({
          id: p.id,
          name: p.name || "",
          logo: p.logo || "",
        }))
      : [],
    address: row.address || "",
    coordinates: row.lat && row.lng ? { lat: row.lat, lng: row.lng } : undefined,
    ticketType: row.ticket_type || "free",
    ticketUrl: row.ticket_url || "",
    ticketPrice: row.ticket_price ?? null,
    status: (row.status || "upcoming") as EventStatus,
    rsvpCount: row.rsvp_count || 0,
    capacity: row.capacity ?? null,
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}
