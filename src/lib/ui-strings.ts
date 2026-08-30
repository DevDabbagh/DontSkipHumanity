import { supabase } from "./supabase";
import { pickLang } from "./i18n";

/**
 * Interface strings — "ثوابت النظام".
 *
 * Everything the site says on its own behalf: nav items, buttons, section
 * eyebrows, footer headings. Content lives in the content tables; this is the
 * frame around it, which used to be hard-coded English — so an Arabic page
 * rendered Arabic prose inside English chrome.
 *
 * The dashboard edits `site_settings.ui_strings`; the map below is the
 * fallback, used before the row exists and for any key an editor hasn't
 * translated yet. Both are generated from migration 018, so they agree.
 *
 * A missing key returns its own name rather than an empty string: a visible
 * `studio.credits` in the page is a bug report, silence is not.
 */

export type UiStringMap = Record<string, Record<string, string>>;

export const DEFAULT_UI_STRINGS: UiStringMap = {
  "nav.films": {
    "en": "Films",
    "pt": "Filmes",
    "ar": "أفلام"
  },
  "nav.studio": {
    "en": "Studio",
    "pt": "Estúdio",
    "ar": "الاستوديو"
  },
  "nav.academy": {
    "en": "Academy",
    "pt": "Academia",
    "ar": "الأكاديمية"
  },
  "nav.read": {
    "en": "Read",
    "pt": "Ler",
    "ar": "اقرأ"
  },
  "nav.about": {
    "en": "About",
    "pt": "Sobre",
    "ar": "عن DSH"
  },
  "nav.support": {
    "en": "Support",
    "pt": "Apoiar",
    "ar": "ادعمنا"
  },
  "nav.login": {
    "en": "Login",
    "pt": "Entrar",
    "ar": "تسجيل الدخول"
  },
  "nav.logout": {
    "en": "Logout",
    "pt": "Sair",
    "ar": "تسجيل الخروج"
  },
  "nav.profile": {
    "en": "Profile",
    "pt": "Perfil",
    "ar": "الملف الشخصي"
  },
  "nav.menu": {
    "en": "Menu",
    "pt": "Menu",
    "ar": "القائمة"
  },
  "nav.language": {
    "en": "Change language",
    "pt": "Mudar idioma",
    "ar": "تغيير اللغة"
  },
  "common.back": {
    "en": "Back",
    "pt": "Voltar",
    "ar": "رجوع"
  },
  "common.close": {
    "en": "Close",
    "pt": "Fechar",
    "ar": "إغلاق"
  },
  "common.knowMore": {
    "en": "Know more",
    "pt": "Saber mais",
    "ar": "اعرف أكثر"
  },
  "common.getInTouch": {
    "en": "Get in touch",
    "pt": "Fale connosco",
    "ar": "تواصل معنا"
  },
  "common.share": {
    "en": "Share this project",
    "pt": "Partilhar este projeto",
    "ar": "شارك هذا المشروع"
  },
  "common.linkCopied": {
    "en": "Link copied",
    "pt": "Ligação copiada",
    "ar": "تم نسخ الرابط"
  },
  "studio.eyebrow": {
    "en": "studio",
    "pt": "estúdio",
    "ar": "الاستوديو"
  },
  "studio.exploreWork": {
    "en": "Explore the work",
    "pt": "Explorar o trabalho",
    "ar": "استكشف الأعمال"
  },
  "studio.credits": {
    "en": "Credits",
    "pt": "Créditos",
    "ar": "طاقم العمل"
  },
  "studio.editorialContext": {
    "en": "Editorial Context",
    "pt": "Contexto editorial",
    "ar": "السياق التحريري"
  },
  "studio.otherSuggestions": {
    "en": "other suggestions",
    "pt": "outras sugestões",
    "ar": "اقتراحات أخرى"
  },
  "studio.viewAllEpisodes": {
    "en": "View all episodes",
    "pt": "Ver todos os episódios",
    "ar": "كل الحلقات"
  },
  "studio.producedBy": {
    "en": "Produced by",
    "pt": "Produzido por",
    "ar": "إنتاج"
  },
  "studio.requestScreener": {
    "en": "Request a screener",
    "pt": "Pedir screener",
    "ar": "اطلب نسخة للمشاهدة"
  },
  "studio.requestScreening": {
    "en": "Request a screening",
    "pt": "Pedir exibição",
    "ar": "اطلب عرضًا"
  },
  "studio.contactDistribution": {
    "en": "Contact for distribution",
    "pt": "Contacto para distribuição",
    "ar": "للتوزيع تواصل معنا"
  },
  "episode.view": {
    "en": "View episode",
    "pt": "Ver episódio",
    "ar": "شاهد الحلقة"
  },
  "episode.season": {
    "en": "Season",
    "pt": "Temporada",
    "ar": "الموسم"
  },
  "episode.episode": {
    "en": "Episode",
    "pt": "Episódio",
    "ar": "الحلقة"
  },
  "episode.guest": {
    "en": "Guest",
    "pt": "Convidado",
    "ar": "الضيف"
  },
  "episode.episodes": {
    "en": "Episodes",
    "pt": "Episódios",
    "ar": "الحلقات"
  },
  "episode.gallery": {
    "en": "Episode gallery",
    "pt": "Galeria do episódio",
    "ar": "معرض الحلقة"
  },
  "episode.glossary": {
    "en": "Glossary",
    "pt": "Glossário",
    "ar": "المعجم"
  },
  "episode.recommendations": {
    "en": "Guest Recommendations",
    "pt": "Recomendações do convidado",
    "ar": "ترشيحات الضيف"
  },
  "episode.source": {
    "en": "Source:",
    "pt": "Fonte:",
    "ar": "المصدر:"
  },
  "episode.download": {
    "en": "Download Documentation",
    "pt": "Descarregar documentação",
    "ar": "تحميل الوثائق"
  },
  "episode.shareDoc": {
    "en": "Share Documentation",
    "pt": "Partilhar documentação",
    "ar": "مشاركة الوثائق"
  },
  "episode.noVideo": {
    "en": "This episode has no video yet.",
    "pt": "Este episódio ainda não tem vídeo.",
    "ar": "لسه مافيش فيديو للحلقة دي."
  },
  "episode.playFailed": {
    "en": "This episode couldn’t be played.",
    "pt": "Não foi possível reproduzir este episódio.",
    "ar": "تعذّر تشغيل الحلقة."
  },
  "newsletter.heading": {
    "en": "Don't look away.",
    "pt": "Não desvie o olhar.",
    "ar": "لا تُشِح بنظرك."
  },
  "newsletter.email": {
    "en": "Email address",
    "pt": "Endereço de email",
    "ar": "البريد الإلكتروني"
  },
  "newsletter.subscribe": {
    "en": "Subscribe our newsletter",
    "pt": "Subscrever a newsletter",
    "ar": "اشترك في النشرة"
  },
  "newsletter.sending": {
    "en": "Sending…",
    "pt": "A enviar…",
    "ar": "جارٍ الإرسال…"
  },
  "newsletter.checkInbox": {
    "en": "Check your inbox",
    "pt": "Verifique o seu email",
    "ar": "راجع بريدك"
  },
  "newsletter.consent": {
    "en": "I agree to receive emails from DSH. We don't share your address.",
    "pt": "Concordo em receber emails da DSH. Não partilhamos o seu endereço.",
    "ar": "أوافق على تلقّي رسائل من DSH. لا نشارك عنوانك مع أحد."
  },
  "footer.films": {
    "en": "Films",
    "pt": "Filmes",
    "ar": "أفلام"
  },
  "footer.allFilms": {
    "en": "All films",
    "pt": "Todos os filmes",
    "ar": "كل الأفلام"
  },
  "footer.allArticles": {
    "en": "All articles",
    "pt": "Todos os artigos",
    "ar": "كل المقالات"
  },
  "footer.allEvents": {
    "en": "All events",
    "pt": "Todos os eventos",
    "ar": "كل الفعاليات"
  },
  "footer.allPrograms": {
    "en": "All programs",
    "pt": "Todos os programas",
    "ar": "كل البرامج"
  },
  "footer.courses": {
    "en": "Courses",
    "pt": "Cursos",
    "ar": "دورات"
  },
  "footer.workshops": {
    "en": "Workshops",
    "pt": "Workshops",
    "ar": "ورش عمل"
  },
  "footer.toolkits": {
    "en": "Toolkits",
    "pt": "Kits",
    "ar": "أدوات"
  },
  "footer.journalism": {
    "en": "Journalism",
    "pt": "Jornalismo",
    "ar": "صحافة"
  },
  "footer.opinion": {
    "en": "Opinion",
    "pt": "Opinião",
    "ar": "رأي"
  },
  "footer.interviews": {
    "en": "Interviews",
    "pt": "Entrevistas",
    "ar": "حوارات"
  },
  "footer.screenings": {
    "en": "Screenings",
    "pt": "Exibições",
    "ar": "عروض"
  },
  "footer.docuseries": {
    "en": "Docuseries",
    "pt": "Documentários em série",
    "ar": "سلاسل وثائقية"
  },
  "footer.supportWork": {
    "en": "Support the work",
    "pt": "Apoiar o trabalho",
    "ar": "ادعم العمل"
  },
  "footer.aboutDsh": {
    "en": "About DSH",
    "pt": "Sobre a DSH",
    "ar": "عن DSH"
  },
  "footer.privacy": {
    "en": "Privacy Policy",
    "pt": "Política de privacidade",
    "ar": "سياسة الخصوصية"
  },
  "footer.cookies": {
    "en": "Cookie Policy",
    "pt": "Política de cookies",
    "ar": "سياسة الكوكيز"
  },
  "footer.terms": {
    "en": "Terms",
    "pt": "Termos",
    "ar": "الشروط"
  },
  "footer.agenda": {
    "en": "Agenda",
    "pt": "Agenda",
    "ar": "الأجندة"
  },
  "footer.podcasts": {
    "en": "Podcasts & Videocasts",
    "pt": "Podcasts e videocasts",
    "ar": "بودكاست وفيديوكاست"
  },
  "footer.productionCapacity": {
    "en": "Production Capacity",
    "pt": "Capacidade de produção",
    "ar": "القدرات الإنتاجية"
  },
  "footer.copyright": {
    "en": "Copyright {year} © Don't Skip Humanity – an independent media company. All rights reserved.",
    "pt": "Copyright {year} © Don't Skip Humanity – uma empresa de media independente. Todos os direitos reservados.",
    "ar": "حقوق النشر {year} © Don't Skip Humanity — شركة إعلامية مستقلة. جميع الحقوق محفوظة."
  },
  "newsletter.description": {
    "en": "One email when something matters — a new film, a piece, a screening, an open call. Work that names what power tries to hide. No noise.",
    "pt": "Um email quando algo importa — um novo filme, um texto, uma exibição, uma chamada aberta. Trabalho que nomeia o que o poder tenta esconder. Sem ruído.",
    "ar": "رسالة واحدة حين يستحق الأمر — فيلم جديد، مقال، عرض، دعوة مفتوحة. عمل يسمّي ما تحاول السلطة إخفاءه. بلا ضجيج."
  },
  "newsletter.confirmSent": {
    "en": "Almost there — we've sent you a link to confirm. You'll only start receiving emails once you click it.",
    "pt": "Quase lá — enviámos-lhe uma ligação para confirmar. Só começará a receber emails depois de clicar nela.",
    "ar": "اقتربنا — أرسلنا لك رابط تأكيد. لن تصلك الرسائل إلا بعد الضغط عليه."
  },
  "newsletter.error": {
    "en": "That didn't go through. Check the address and try again.",
    "pt": "Não foi possível concluir. Verifique o endereço e tente novamente.",
    "ar": "لم تنجح العملية. راجع العنوان وحاول مرة أخرى."
  },
  "academy.eyebrow": {
    "en": "Academy",
    "pt": "Academia",
    "ar": "الأكاديمية"
  },
  "academy.discoverCourses": {
    "en": "Discover our courses",
    "pt": "Descobrir os cursos",
    "ar": "استكشف الدورات"
  },
  "academy.whatWeOffer": {
    "en": "What we offer",
    "pt": "O que oferecemos",
    "ar": "ما نقدّمه"
  },
  "academy.whatWeAim": {
    "en": "What we aim",
    "pt": "O que procuramos",
    "ar": "ما نسعى إليه"
  },
  "academy.featured": {
    "en": "Featured course",
    "pt": "Curso em destaque",
    "ar": "دورة مختارة"
  },
  "academy.ledBy": {
    "en": "Led by",
    "pt": "Orientado por",
    "ar": "بإشراف"
  },
  "academy.enroll": {
    "en": "Enroll now",
    "pt": "Inscrever-se",
    "ar": "سجّل الآن"
  },
  "academy.free": {
    "en": "Free",
    "pt": "Gratuito",
    "ar": "مجاني"
  },
  "academy.paid": {
    "en": "Paid",
    "pt": "Pago",
    "ar": "مدفوع"
  },
  "academy.freeByPrinciple": {
    "en": "free by principle",
    "pt": "gratuito por princípio",
    "ar": "مجاني من حيث المبدأ"
  },
  "academy.noneMatch": {
    "en": "No programs match these filters yet.",
    "pt": "Nenhum programa corresponde a estes filtros.",
    "ar": "لا توجد برامج تطابق هذه الفلاتر بعد."
  }
};

let cache: { at: number; strings: UiStringMap } | null = null;
const TTL_MS = 60_000;

/** The dashboard's copy, merged over the built-in defaults. */
export async function getUiStrings(): Promise<UiStringMap> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.strings;
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "ui_strings")
      .single();
    if (error || !data?.value) return DEFAULT_UI_STRINGS;

    const raw = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return DEFAULT_UI_STRINGS;

    /* Merged, not replaced: a key added in a deploy but not yet saved by an
       editor still renders, instead of showing its own key name. */
    const strings: UiStringMap = { ...DEFAULT_UI_STRINGS };
    for (const [key, value] of Object.entries(raw as UiStringMap)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        strings[key] = { ...(strings[key] || {}), ...value };
      }
    }

    cache = { at: Date.now(), strings };
    return strings;
  } catch {
    return DEFAULT_UI_STRINGS;
  }
}

/** Flatten to one language, for handing to client components as a plain object. */
export function flattenUiStrings(
  strings: UiStringMap,
  locale: string,
  defaultLocale: string
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(strings)) {
    out[key] = pickLang(value, locale, defaultLocale) || key;
  }
  return out;
}

/** `t` for server components. */
export async function getT(locale: string, defaultLocale: string) {
  const strings = await getUiStrings();
  return (key: string) => pickLang(strings[key], locale, defaultLocale) || key;
}
