import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Don't Skip Humanity — Stories That Change How You See The World",
  description:
    "Independent media platform for impact storytelling, documentary films, courses, and collective liberation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-[#0D0D0D] text-white font-[var(--font-inter)]">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
