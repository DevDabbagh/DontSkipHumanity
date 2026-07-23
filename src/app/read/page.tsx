import { getArticles } from "@/lib/api";
import ReadListing from "./ReadListing";

export const metadata = {
  title: "Read — Don't Skip Humanity",
  description: "Journalism, essays, opinion, and field notes — work that names what power tries to hide.",
};

export default async function ReadPage() {
  const articles = await getArticles();
  return <ReadListing articles={articles} />;
}
