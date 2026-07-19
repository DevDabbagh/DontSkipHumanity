import { MOCK_EVENTS } from "@/lib/mock-data";
import AgendaListing from "./AgendaListing";

export const metadata = {
  title: "Agenda — Don't Skip Humanity",
  description: "Screenings, workshops, and public programming — where the work meets the world.",
};

export default function AgendaPage() {
  return <AgendaListing events={MOCK_EVENTS} />;
}
