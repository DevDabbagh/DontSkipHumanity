import type { Metadata } from "next";
import { Inter, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import SupportBanner from "@/components/SupportBanner";
import { AuthProvider } from "@/contexts/AuthContext";
import { getRequestLocale } from "@/lib/locale-server";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { getUiStrings, flattenUiStrings } from "@/lib/ui-strings";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceSans3 = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
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
  /* `lang` and `dir` come from the request's locale. `dir` is what flips the
     whole layout for Arabic — every logical property (ms-, me-, ps-, pe-,
     start/end) mirrors off this one attribute, which is why the CSS uses them
     rather than left/right. */
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
      dir={locale.direction}
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
