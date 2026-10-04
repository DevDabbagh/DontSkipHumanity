/**
 * API Service Layer
 * ─────────────────
 * Reads per-module data_source settings from Supabase (set via dashboard Settings → Data Switcher).
 *
 * Each module (films, studio, academy, articles, events, impact) can independently be:
 *   "mock" → return mock data
 *   "live" → try Supabase for published content, fallback to mock if empty/error
 *
 * Falls back to the legacy global "data_source" key if per-module settings don't exist.
 * Settings are cached for 10 seconds to avoid hammering Supabase.
 */

import type { Film, AcademyProgram, AcademyInstructor, Article, DSHEvent, StudioProject } from "./types";
import { slugifyName } from "./slug";
import { supabase } from "./supabase";
import { mapFilm, mapStudioProject, mapAcademyProgram, mapArticle, mapEvent, attachQuestions, mapInstructorRow } from "./mappers";
import type { QuestionRow } from "./mappers";
import { setMapperLocale } from "./mappers";
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

// ─── Data Source Check (per-module) ─────────────────────────────

type ContentModule = "films" | "studio" | "academy" | "articles" | "events" | "impact";
type ModuleSources = Record<ContentModule, "mock" | "live">;

let _cachedModuleSources: ModuleSources | null = null;
let _cacheTime = 0;
const CACHE_TTL = 10_000; // 10 seconds

const DEFAULT_SOURCES: ModuleSources = {
  films: "mock", studio: "mock", academy: "mock",
  articles: "mock", events: "mock", impact: "mock",
};

/**
 * Safely parse a JSONB value from Supabase.
 * The value column is JSONB, so supabase-js may return:
 *  - a JS string (for JSONB string values like "live")
 *  - a JS object (for JSONB objects)
 *  - a JSON-encoded string that needs parsing (if stored via JSON.stringify)
 */
function parseJsonb(val: unknown): unknown {
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
}

async function loadDataSources(): Promise<void> {
  const now = Date.now();
  if (_cachedModuleSources && now - _cacheTime < CACHE_TTL) return;

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["data_source_modules", "data_source"]);

    if (!error && data) {
      // Try per-module settings first
      const modulesRow = data.find((r: any) => r.key === "data_source_modules");
      if (modulesRow) {
        const raw = parseJsonb(modulesRow.value);
        if (raw && typeof raw === "object") {
          const merged = { ...DEFAULT_SOURCES };
          for (const key of Object.keys(merged) as ContentModule[]) {
            if ((raw as any)[key] === "mock" || (raw as any)[key] === "live") {
              merged[key] = (raw as any)[key];
            }
          }
          _cachedModuleSources = merged;
          _cacheTime = now;
          return;
        }
      }

      // Fallback: legacy global data_source
      const globalRow = data.find((r: any) => r.key === "data_source");
      if (globalRow) {
        const parsed = parseJsonb(globalRow.value);
        if (parsed === "mock" || parsed === "live") {
          _cachedModuleSources = Object.fromEntries(
            Object.keys(DEFAULT_SOURCES).map((k) => [k, parsed])
          ) as ModuleSources;
          _cacheTime = now;
          return;
        }
      }
    }
  } catch {}

  // Default to all mock
  _cachedModuleSources = { ...DEFAULT_SOURCES };
  _cacheTime = now;
}

/* Exported so the Read body route can answer from the same source the pages
   read from. A route that always went straight to Supabase while the pages
   were on mock would 404 every mock article — which is exactly what it did. */
export async function isModuleLive(module: ContentModule): Promise<boolean> {
  await loadDataSources();
  return _cachedModuleSources?.[module] === "live";
}

// ─── Films ──────────────────────────────────────────────────────

/**
 * Tell the mappers which language to read before any of them run.
 *
 * Called at the top of every reader. Cheap, and it keeps the locale out of two
 * dozen function signatures — see the note on `setMapperLocale`.
 */
async function useRequestLocale() {
  try {
    const { getRequestLocale } = await import("./locale-server");
    const { locale, defaultLocale } = await getRequestLocale();
    setMapperLocale(locale.code, defaultLocale.code);
  } catch {
    /* Called outside a request (a build-time page, a script): the mappers keep
       their default and the site renders the default language. */
  }
}

export async function getFilms(): Promise<Film[]> {
  await useRequestLocale();
  if (await isModuleLive("films")) {
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
  await useRequestLocale();
  if (await isModuleLive("films")) {
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
  await useRequestLocale();
  if (await isModuleLive("films")) {
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
  await useRequestLocale();
  return getFilms();
}

// ─── Studio ─────────────────────────────────────────────────────

export async function getStudioProjects(): Promise<StudioProject[]> {
  await useRequestLocale();
  if (await isModuleLive("studio")) {
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

export async function getStudioProjectBySlug(
  slug: string
): Promise<StudioProject | null> {
  await useRequestLocale();
  if (await isModuleLive("studio")) {
    try {
      const { data, error } = await supabase
        .from("studio_items")
        .select("*, studio_episodes(*), studio_platform_links(*)")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (!error && data) return mapStudioProject(data);
    } catch {}
  }
  return MOCK_STUDIO.find((p) => p.slug === slug) ?? null;
}

// ─── Academy Programs ───────────────────────────────────────────

export async function getPrograms(): Promise<AcademyProgram[]> {
  await useRequestLocale();
  if (await isModuleLive("academy")) {
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

/**
 * The course page and the player need the whole tree: sections → lessons, and
 * the instructors. Each embed rides a single foreign key (047), so PostgREST
 * resolves it without hints.
 */
const PROGRAM_DETAIL_SELECT =
  "*, academy_resources(*), " +
  "academy_sections(*, academy_lessons(*)), " +
  "academy_program_instructors(position, academy_instructors(*))";

export async function getProgramBySlug(slug: string): Promise<AcademyProgram | null> {
  await useRequestLocale();
  if (await isModuleLive("academy")) {
    try {
      const rich = await supabase
        .from("academy_programs")
        .select(PROGRAM_DETAIL_SELECT)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (!rich.error && rich.data) {
        const program = mapAcademyProgram(rich.data);
        /* Survey questions live in their own (shared) sets, read through the
           view that leaves the answer key out. A failure here only costs the
           options — the survey falls back to a text answer — so it is logged,
           not fatal. */
        const setIds = [
          ...new Set((program.sections ?? []).flatMap((s) => s.lessons.map((l) => l.questionSetId)).filter(Boolean)),
        ] as string[];
        if (setIds.length) {
          const qs = await supabase
            .from("academy_questions_public")
            .select("id, set_id, position, prompt, kind, options")
            .in("set_id", setIds);
          if (qs.error) console.error(`[academy] questions query failed for "${slug}": ${qs.error.message}`);
          else attachQuestions(program, (qs.data ?? []) as QuestionRow[]);
        }
        return program;
      }

      /* If the curriculum embed itself fails — 047 not run on this database,
         a relationship PostgREST cannot resolve — fall back to the flat query
         so the course still renders from the old columns. But SAY so: the
         previous version swallowed every error and served mock data, which
         is how a broken query passes for a working page. */
      if (rich.error) {
        console.error(`[academy] curriculum query failed for "${slug}": ${rich.error.message}`);
        const flat = await supabase
          .from("academy_programs")
          .select("*, academy_resources(*)")
          .eq("slug", slug)
          .eq("status", "published")
          .maybeSingle();
        if (!flat.error && flat.data) return mapAcademyProgram(flat.data);
      }
    } catch (e) {
      console.error(`[academy] getProgramBySlug("${slug}") threw:`, e);
    }
  }
  return mockGetProgram(slug) ?? null;
}

// ─── Articles ───────────────────────────────────────────────────

export async function getArticles(): Promise<Article[]> {
  await useRequestLocale();
  if (await isModuleLive("articles")) {
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
  await useRequestLocale();
  if (await isModuleLive("articles")) {
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
  await useRequestLocale();
  if (await isModuleLive("events")) {
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
  await useRequestLocale();
  if (await isModuleLive("events")) {
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
  await useRequestLocale();
  if (await isModuleLive("events")) {
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
  await useRequestLocale();
  if (await isModuleLive("impact")) {
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

// ─── Instructor profile ──────────────────────────────────────────

export interface InstructorProfile {
  instructor: AcademyInstructor;
  courses: AcademyProgram[];
  articles: Article[];
  studio: StudioProject[];
  films: Film[];
}

/**
 * Everything one person has on the platform.
 *
 * Courses come from the instructor ↔ programme link table (047), which is
 * exact. Read, Studio and Films have no person id yet — an article stores its
 * author as a name, Studio lists hosts, a film its director — so those are
 * matched on the name, folded the same way as the URL slug. That is the
 * honest limit of today's data: a different spelling will not match, and a
 * shared people table is the fix if that ever matters.
 */
export async function getInstructorProfile(slug: string): Promise<InstructorProfile | null> {
  await useRequestLocale();
  const same = (name: string | undefined) => Boolean(name) && slugifyName(name!) === slug;

  let instructor: AcademyInstructor | null = null;
  let linkedCourseSlugs: string[] = [];

  if (await isModuleLive("academy")) {
    const { data, error } = await supabase
      .from("academy_instructors")
      .select("*, academy_program_instructors(academy_programs(slug, status))")
      .eq("slug", slug)
      .maybeSingle();
    if (error) console.error(`[academy] instructor "${slug}": ${error.message}`);
    if (data) {
      instructor = mapInstructorRow(data);
      linkedCourseSlugs = ((data.academy_program_instructors ?? []) as { academy_programs: { slug: string; status: string } | null }[])
        .map((l) => l.academy_programs)
        .filter((p): p is { slug: string; status: string } => Boolean(p && p.status === "published"))
        .map((p) => p.slug);
    }
  }

  const [programs, articles, studio, films] = await Promise.all([
    getPrograms(),
    getArticles(),
    getStudioProjects(),
    getFilms(),
  ]);

  const courses = programs.filter((p) => linkedCourseSlugs.includes(p.slug) || same(p.whoLeads));

  // A course from before 047 (or mock data) has a name and nothing else.
  if (!instructor) {
    const name = courses[0]?.whoLeads;
    if (!name) return null;
    instructor = { slug, name, role: "", bio: "", handles: [], photoUrl: "" };
  }

  return {
    instructor,
    courses,
    articles: articles.filter((a) => same(a.author?.name)),
    studio: studio.filter(
      (s) => (s.credits?.hosts ?? []).some((h) => same(h)) || same(s.credits?.direction)
    ),
    films: films.filter((f) => (f.credits?.direction ?? "").split(/,|&| e | and /).some((n) => same(n.trim()))),
  };
}
