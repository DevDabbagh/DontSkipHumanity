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
      {/* Film grain overlay */}
      <div className="film-grain" />

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
