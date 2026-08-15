import type { Metadata } from "next";
import { Inter, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import SupportBanner from "@/components/SupportBanner";
import { AuthProvider } from "@/contexts/AuthContext";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSans3.variable} antialiased`}>
      <body className="min-h-screen bg-[#0D0D0D] text-white font-[var(--font-inter)]">
        <AuthProvider>
          {children}
          <SupportBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
