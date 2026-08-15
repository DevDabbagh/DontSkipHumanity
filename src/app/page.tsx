import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TheWork from "@/components/TheWork";
import Academy from "@/components/Academy";
import Journalism from "@/components/Journalism";
import InFocus from "@/components/InFocus";
import Impact from "@/components/Impact";
import SupportCTA from "@/components/SupportCTA";
import Notebook from "@/components/Notebook";
import Agenda from "@/components/Agenda";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { getLandingConfig, firstSlotImage, buildHeroSlides } from "@/lib/landing";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cms = await getLandingConfig();

  const films = cms.films;
  const studio = cms.studio;
  const academy = cms.academy;
  const read = cms.read;
  const infocus = cms.infocus;
  const newsletter = cms.newsletter;
  const heroSlides = buildHeroSlides(cms.hero);

  return (
    <main className="relative">
      {/* Top background gradient — #1E1E1E at the very top fading into the page's
          solid #0D0D0D (body background). Sits behind all content. Replaces the
          old noise/film-grain overlay. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[700px] -z-10 bg-gradient-to-b from-[#1E1E1E] to-[#0D0D0D]" />

      <Navbar />
      <Hero slides={heroSlides} heading={cms.hero?.text?.heading} />
      <TheWork
        filmsConfig={{ ...films?.text, imageSrc: firstSlotImage(films) }}
        studioConfig={{ ...studio?.text, imageSrc: firstSlotImage(studio) }}
        showFilms={films?.enabled !== false}
        showStudio={studio?.enabled !== false}
      />
      {academy?.enabled !== false && (
        <Academy config={{ ...academy?.text, imageSrc: firstSlotImage(academy) }} />
      )}
      {read?.enabled !== false && (
        <Journalism config={{ ...read?.text, imageSrc: firstSlotImage(read) }} />
      )}
      {infocus?.enabled !== false && (
        <InFocus config={{ ...infocus?.text, imageSrc: firstSlotImage(infocus) }} />
      )}
      <Impact />
      <SupportCTA />
      <Notebook />
      <Agenda />
      {newsletter?.enabled !== false && (
        <Newsletter config={{ ...newsletter?.text, imageSrc: firstSlotImage(newsletter) }} />
      )}
      <Footer />
    </main>
  );
}
