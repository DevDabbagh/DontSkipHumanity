/**
 * API Service Layer
 * ─────────────────
 * Reads the data_source setting from Supabase (set via dashboard Settings toggle).
 *
 * "mock" → always return mock data
 * "live" → try Supabase for published content, fallback to mock if empty/error
 *
 * The setting is cached per request cycle so we only read it once.
 */

import type { Film, AcademyProgram, Article, DSHEvent, StudioProject } from "./types";
import { supabase } from "./supabase";
import { mapFilm, mapStudioProject, mapAcademyProgram, mapArticle, mapEvent } from "./mappers";
import {
  MOCK_FILMS,
  MOCK_PROGRAMS,
  MOCK_ARTICLES,
  MOCK_EVENTS,
  MOCK_STUDIO,
  getFilmBySlug as mockGetFilm,
  getProgramBySlug as mockGetProgram,
  getArticleBySlug as mockGetArticle,
  getEventBySlug as mockGetEvent,
} from "./mock-data";

// ─── Data Source Check ──────────────────────────────────────────

let _cachedSource: "mock" | "live" | null = null;
let _cacheTime = 0;
const CACHE_TTL = 10_000; // 10 seconds — keeps it fresh without hammering Supabase

async function getDataSource(): Promise<"mock" | "live"> {
  const now = Date.now();
  if (_cachedSource && now - _cacheTime < CACHE_TTL) return _cachedSource;

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "data_source")
      .single();

    if (!error && data) {
      // value is stored as JSON string: '"mock"' or '"live"'
      const raw = typeof data.value === "string" ? data.value : JSON.stringify(data.value);
      const parsed = JSON.parse(raw);
      if (parsed === "mock" || parsed === "live") {
        _cachedSource = parsed;
        _cacheTime = now;
        return parsed;
      }
    }
  } catch {}

  // Default to mock if we can't read the setting
  return "mock";
}

async function isLive(): Promise<boolean> {
  return (await getDataSource()) === "live";
}

// ─── Films ──────────────────────────────────────────────────────

export async function getFilms(): Promise<Film[]> {
  if (await isLive()) {
    try {
      const { data, error } = await supabase
        .from("films")
        .select("*, film_festivals(*), film_press_quotes(*), film_screenings(*)")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) return data.map(mapFilm);
    } catch {}
    // Live mode but no data → fallback to mock
  }
  return MOCK_FILMS.filter((f) => f.status === "published");
}

export async function getFeaturedFilms(): Promise<Film[]> {
  if (await isLive()) {
    try {
      const { data, error } = await supabase
        .from("films")
        .select("*, film_festivals(*), film_press_quotes(*), film_screenings(*)")
        .eq("status", "published")
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) return data.map(mapFilm);
    } catch {}
  }
  return MOCK_FILMS.filter((f) => f.status === "published" && f.isFeatured);
}

export async function getFilmBySlug(slug: string): Promise<Film | null> {
  if (await isLive()) {
    try {
      const { data, error } = await supabase
        .from("films")
        .select("*, film_festivals(*), film_press_quotes(*), film_screenings(*)")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (!error && data) return mapFilm(data);
    } catch {}
  }
  return mockGetFilm(slug) ?? null;
}

export async function getAllFilms(): Promise<Film[]> {
  return getFilms();
}

// ─── Studio ─────────────────────────────────────────────────────

export async function getStudioProjects(): Promise<StudioProject[]> {
  if (await isLive()) {
    try {
      const { data, error } = await supabase
        .from("studio_items")
        .select("*, studio_episodes(*), studio_platform_links(*)")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) return data.map(mapStudioProject);
    } catch {}
  }
  return MOCK_STUDIO;
}

// ─── Academy Programs ───────────────────────────────────────────

export async function getPrograms(): Promise<AcademyProgram[]> {
  if (await isLive()) {
    try {
      const { data, error } = await supabase
        .from("academy_programs")
        .select("*, academy_resources(*)")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) return data.map(mapAcademyProgram);
    } catch {}
  }
  return MOCK_PROGRAMS.filter((p) => p.status === "published");
}

export async function getProgramBySlug(slug: string): Promise<AcademyProgram | null> {
  if (await isLive()) {
    try {
      const { data, error } = await supabase
        .from("academy_programs")
        .select("*, academy_resources(*)")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (!error && data) return mapAcademyProgram(data);
    } catch {}
  }
  return mockGetProgram(slug) ?? null;
}

// ─── Articles ───────────────────────────────────────────────────

export async function getArticles(): Promise<Article[]> {
  if (await isLive()) {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .order("date", { ascending: false });

      if (!error && data && data.length > 0) return data.map(mapArticle);
    } catch {}
  }
  return MOCK_ARTICLES.filter((a) => a.status === "published");
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (await isLive()) {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (!error && data) return mapArticle(data);
    } catch {}
  }
  return mockGetArticle(slug) ?? null;
}

// ─── Events ─────────────────────────────────────────────────────

export async function getEvents(): Promise<DSHEvent[]> {
  if (await isLive()) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*, event_partners(*)")
        .order("start_date", { ascending: true });

      if (!error && data && data.length > 0) return data.map(mapEvent);
    } catch {}
  }
  return MOCK_EVENTS;
}

export async function getUpcomingEvents(): Promise<DSHEvent[]> {
  if (await isLive()) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*, event_partners(*)")
        .eq("status", "upcoming")
        .order("start_date", { ascending: true });

      if (!error && data && data.length > 0) return data.map(mapEvent);
    } catch {}
  }
  return MOCK_EVENTS.filter((e) => e.status === "upcoming");
}

export async function getEventBySlug(slug: string): Promise<DSHEvent | null> {
  if (await isLive()) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*, event_partners(*)")
        .eq("slug", slug)
        .single();

      if (!error && data) return mapEvent(data);
    } catch {}
  }
  return mockGetEvent(slug) ?? null;
}

// ─── Dashboard Stats (for impact section) ───────────────────────

export async function getDashboardStats() {
  if (await isLive()) {
    try {
      const { data, error } = await supabase
        .from("impact_stats")
        .select("*");

      if (!error && data && data.length > 0) {
        return {
          countriesReached: data.find((s: any) => s.label === "Countries reached")?.value ?? 47,
          academyParticipants: data.find((s: any) => s.label === "Academy participants")?.value ?? 8200,
          festivalSelections: data.find((s: any) => s.label === "Festival selections")?.value ?? 23,
          redistributed: `€${((data.find((s: any) => s.label === "Redistributed")?.value ?? 2400000) / 1000000).toFixed(1)}M`,
        };
      }
    } catch {}
  }
  return {
    countriesReached: 47,
    academyParticipants: 8200,
    festivalSelections: 23,
    redistributed: "€2.4M",
  };
}
