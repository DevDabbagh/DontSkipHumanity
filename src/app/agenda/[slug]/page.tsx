import { notFound } from "next/navigation";
import { getEventBySlug, getEvents } from "@/lib/api";
import EventContent from "./EventContent";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event Not Found — DSH" };
  return {
    title: `${event.title} — Don't Skip Humanity`,
    description: event.excerpt,
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const allEvents = await getEvents();
  const relatedEvents = allEvents
    .filter((e) => e.slug !== event.slug)
    .slice(0, 3);

  return <EventContent event={event} relatedEvents={relatedEvents} />;
}
