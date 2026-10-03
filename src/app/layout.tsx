import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SupportBanner from "@/components/SupportBanner";
import { AuthProvider } from "@/contexts/AuthContext";
import { getRequestLocale } from "@/lib/locale-server";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { getUiStrings, flattenUiStrings } from "@/lib/ui-strings";

/* Self-hosted, not next/font/google: on 3 Oct the dashboard's Vercel build
   failed with "next/font/google queries have exactly one entry" — Google Fonts
   returned a URL shape Turbopack cannot parse (vercel/next.js#99114). Same
   variable fonts (Fontsource, OFL-1.1, latin subset — covers Portuguese), so
   the build no longer depends on Google answering. */
const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

const sourceSans3 = localFont({
  src: "./fonts/source-sans-3-latin-wght-normal.woff2",
  variable: "--font-source-sans",
  weight: "200 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Don't Skip Humanity — Stories That Change How You See The World",
    template: "%s — Don't Skip Humanity",
  },
  description:
    "Independent media platform for impact storytelling, documentary films, courses, and collective liberation.",
  metadataBase: new URL("https://dont-skip-humanity.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Don't Skip Humanity",
    title: "Don't Skip Humanity — Stories That Change How You See The World",
    description:
      "Independent media platform for impact storytelling, documentary films, courses, and collective liberation.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Don't Skip Humanity",
    description:
      "Independent media platform for impact storytelling, documentary films, courses, and collective liberation.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /*
   * `lang` follows the locale. `dir` deliberately does NOT.
   *
   * Setting `dir="rtl"` here mirrored the entire page: every image swapped
   * sides, because a 50%-wide block in normal flow starts from the right under
   * RTL. Measuring the rendered boxes on /ar against / showed all nine sections
   * flipped, including the hero and the footer logo.
   *
   * The design places those images deliberately, and that composition is the
   * same in every language, so the layout axis stays left-to-right. Arabic TEXT
   * is still right-to-left — globals.css gives it `direction: rtl` per text
   * block under `html[lang="ar"]`. Layout frozen, text free.
   */
  const { locale, locales, defaultLocale, pathname } = await getRequestLocale();

  /* Resolved once per request and handed down: the navbar, the footer and every
     other client component would otherwise each need its own round-trip for
     text the server has already fetched. */
  const strings = flattenUiStrings(
    await getUiStrings(),
    locale.code,
    defaultLocale.code
  );

  return (
    <html
      lang={locale.code}
      dir="ltr"
      className={`${inter.variable} ${sourceSans3.variable} antialiased`}
    >
      <body className="min-h-screen bg-[#0D0D0D] text-white font-[var(--font-inter)]">
        <LocaleProvider
          value={{
            locale,
            locales,
            defaultCode: defaultLocale.code,
            pathname,
            strings,
          }}
        >
          <AuthProvider>
            {children}
            <SupportBanner />
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
