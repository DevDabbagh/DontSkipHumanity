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

export default function Home() {
  return (
    <main className="relative">
      {/* Film grain overlay */}
      <div className="film-grain" />

      <Navbar />
      <Hero />
      <TheWork />
      <Academy />
      <Journalism />
      <InFocus />
      <Impact />
      <SupportCTA />
      <Notebook />
      <Agenda />
      <Newsletter />
      <Footer />
    </main>
  );
}
