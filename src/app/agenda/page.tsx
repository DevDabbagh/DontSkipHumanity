import { getEvents } from "@/lib/api";
import AgendaListing from "./AgendaListing";

export const metadata = {
  title: "Agenda — Don't Skip Humanity",
  description: "Screenings, workshops, and public programming — where the work meets the world.",
};

export default async function AgendaPage() {
  const events = await getEvents();
  return <AgendaListing events={events} />;
}
