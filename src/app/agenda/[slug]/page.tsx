import { notFound } from "next/navigation";
import { getEventBySlug, MOCK_EVENTS } from "@/lib/mock-data";
import EventContent from "./EventContent";

export function generateStaticParams() {
  return MOCK_EVENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: "Event Not Found — DSH" };
  return {
    title: `${event.title} — Don't Skip Humanity`,
    description: event.excerpt,
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const relatedEvents = MOCK_EVENTS
    .filter((e) => e.slug !== event.slug)
    .slice(0, 3);

  return <EventContent event={event} relatedEvents={relatedEvents} />;
}
