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
  festivals: FilmFestival[];
  pressQuotes: { source: string; quote: string }[];
  screenings: FilmScreening[];
  accessMode: "public" | "request_only";
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
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
