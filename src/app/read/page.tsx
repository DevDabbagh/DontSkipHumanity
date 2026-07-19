import { MOCK_ARTICLES } from "@/lib/mock-data";
import ReadListing from "./ReadListing";

export const metadata = {
  title: "Read — Don't Skip Humanity",
  description: "Journalism, essays, opinion, and field notes — work that names what power tries to hide.",
};

export default function ReadPage() {
  const articles = MOCK_ARTICLES.filter((a) => a.status === "published");
  return <ReadListing articles={articles} />;
}
