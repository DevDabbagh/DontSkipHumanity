/* ═══════════════════════════════════════
   DSH Landing — Shared Types
   Mirrors dashboard types for API compatibility
   ═══════════════════════════════════════ */

/* ─── Film ────────────────────────────────────────────────────── */

export type FilmStage = "development" | "production" | "post_production" | "festivals" | "distribution" | "impact";
export type FilmForm = "documentary" | "fiction";
export type FilmFormat = "feature" | "short" | "series";

export interface FilmCredit {
  direction: string;
  production: string;
  coProduction: string;
  year: string;
  duration: string;
  form: FilmForm;
  format: FilmFormat;
  language: string;
  country: string;
}

export interface FilmScreening {
  event: string;
  date: string;
  location: string;
  type: "cinema" | "festival" | "community" | "educational" | "online";
}

export interface FilmFestival {
  name: string;
  year: string;
  award?: string;
  selection?: string;
}

export interface Film {
  id: string;
  title: string;
  slug: string;
  logline: string;
  synopsisShort: string;
  synopsisLong: string;
  editorialContext: string;
  credits: FilmCredit;
  stage: FilmStage;
  themes: string[];
  trailerUrl: string;
  thumbnailUrl: string;
  posterUrl: string;
  /* Detail-page horizontal gallery — up to 6 images (min 3 recommended) */
  detailsSliders?: string[];
  festivals: FilmFestival[];
  pressQuotes: { source: string; quote: string }[];
  screenings: FilmScreening[];
  accessMode: "public" | "request_only";
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ─── Studio ──────────────────────────────────────────────────── */

export type StudioFormat = "docuseries" | "videocast" | "podcast" | "series" | "other";
export type StudioStatus = "ongoing" | "complete" | "upcoming";

export interface StudioProject {
  id: string;
  title: string;
  slug: string;
  format: StudioFormat;
  oneLineDescription: string;
  synopsisShort: string;
  synopsisLong: string;
  /**
   * Episodes. `title` / `description` / `duration` are the original shape.
   * The rest are surfaced by the Studio details design (Figma `704:971` —
   * episode rows `709:1455` etc.) and are all OPTIONAL, so existing data,
   * mocks and the dashboard form keep working untouched. The detail page
   * renders whichever of them are present.
   */
  episodes: {
    title: string;
    description: string;
    duration?: string;
    /** Shown under the title, e.g. "– Aida Refugee Camp, Palestine" */
    subtitle?: string;
    /** 1-based; falls back to array order */
    number?: number;
    season?: number;
    year?: string;
    /** Guest credited beneath the episode still */
    guest?: string;
    /** Episode still — 406×260 in the design */
    imageUrl?: string;
    /** Deep link to the episode details page ("Know more") */
    slug?: string;
    /** draft episodes are filtered out before they reach the page. */
    status?: "draft" | "published";
    /**
     * Playback source for the watch lightbox. Empty means the episode has no
     * video yet — "View episode" then falls back to the details page instead
     * of opening an empty player.
     */
    videoUrl?: string;
    /** file (direct MP4, today) | hls | bunny | embed. Defaults to "file". */
    videoProvider?: "file" | "hls" | "bunny" | "embed";

    /* ── Episode details page (Figma `714:3643`) ────────────────────
       All optional. Each section renders ONLY when its data is present,
       so nothing placeholder ever reaches the site. */

    /** Pull quotes, in page order. Rendered as grape left-rule blockquotes. */
    quotes?: string[];
    /** Glossary — Figma `715:214`. Section hides when empty. */
    glossary?: {
      term: string;
      definition: string;
      /** Attribution shown after the "Source:" label */
      source?: string;
      /** 221×288 still beside the entry */
      imageUrl?: string;
    }[];
    /** Standfirst under the "Glossary" eyebrow */
    glossaryIntro?: string;
    /** Body copy beside the Download/Share buttons */
    glossaryNote?: string;
    /** Guest recommendations — same card shape as the glossary. */
    recommendations?: {
      term: string;
      definition: string;
      source?: string;
      imageUrl?: string;
    }[];
    recommendationsIntro?: string;
    recommendationsNote?: string;
    /** Episode gallery carousel — Figma `730:657`. */
    gallery?: string[];
    galleryIntro?: string;
  }[];
  credits: {
    production: string;
    coProduction: string;
    hosts: string[];
    partners: string[];
    year: string;
    language: string;
    /** Optional — additional credit rows in the Studio details design */
    direction?: string;
    duration?: string;
    form?: string;
    formatLabel?: string;
    country?: string;
  };
  status: StudioStatus;
  editorialContext: string;
  listenLinks: { platform: string; url: string }[];
  relatedFilmIds: string[];
  relatedArticleIds: string[];
  relatedCampaignIds: string[];
  thumbnailUrl: string;
  coverUrl: string;
  /**
   * Gallery stills for the details-page carousel (Figma `714:2463`).
   * OPTIONAL — when absent the page falls back to the cover, the episode
   * stills and the thumbnail, so the carousel always has real content and
   * existing data/mocks keep working. Not yet exposed in the dashboard form.
   */
  stills?: string[];
  createdAt: string;
  updatedAt: string;
}

/* ─── Academy ─────────────────────────────────────────────────── */

export type AcademyType = "course" | "workshop" | "toolkit" | "resource" | "mentorship";
export type AcademyFormat = "online" | "in_person" | "hybrid" | "self_paced" | "downloadable";

export interface AcademyProgram {
  id: string;
  title: string;
  slug: string;
  type: AcademyType;
  format: AcademyFormat;
  description: string;
  objectives: string[];
  whoLeads: string;
  whoItsFor: string;
  duration: string;
  isFree: boolean;
  price: number | null;
  scholarshipNote: string;
  dates: string;
  howToJoin: string;
  thumbnailUrl: string;
  resources: { id: string; title: string; type: "pdf" | "link" | "toolkit"; url: string }[];
  relatedFilmIds: string[];
  relatedStudioIds: string[];
  enrolledCount: number;
  completionRate: number;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
}

/* ─── Article ─────────────────────────────────────────────────── */

export type ArticleStatus = "draft" | "published" | "scheduled" | "archived";

export interface ArticleBlock {
  id: string;
  type: "text" | "image" | "quote" | "heading" | "divider" | "html";
  content: string;
  caption?: string;
  credit?: string;
  level?: 2 | 3;
}

export interface ArticleAuthor {
  name: string;
  avatar: string;
  bio?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  tag: string;
  excerpt: string;
  date: string;
  body: ArticleBlock[];
  mainImage: string;
  mainImageCaption: string;
  mainImageCredit: string;
  author: ArticleAuthor;
  gallery: { id: string; url: string; caption: string; credit: string }[];
  status: ArticleStatus;
  scheduledDate: string | null;
  seo: { metaDescription: string; socialShareImage: string };
  createdAt: string;
  updatedAt: string;
}

/* ─── Event ───────────────────────────────────────────────────── */

export type EventStatus = "upcoming" | "past" | "cancelled" | "sold_out";

export interface EventPartner {
  id: string;
  name: string;
  logo: string;
}

export interface DSHEvent {
  id: string;
  title: string;
  slug: string;
  tag: string;
  excerpt: string;
  description: string;
  startDate: string;
  endDate: string;
  mainImage: string;
  partners: EventPartner[];
  address: string;
  coordinates?: { lat: number; lng: number };
  ticketType: "free" | "paid";
  ticketUrl: string;
  ticketPrice: number | null;
  status: EventStatus;
  rsvpCount: number;
  capacity: number | null;
  createdAt: string;
  updatedAt: string;
}
