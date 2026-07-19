import { MOCK_FILMS } from "@/lib/mock-data";
import FilmsListing from "./FilmsListing";

export const metadata = {
  title: "Films — Don't Skip Humanity",
  description: "Documentary and fiction that stay close — to siege, displacement, and the daily labour of remaining human.",
};

export default function FilmsPage() {
  const films = MOCK_FILMS.filter((f) => f.status === "published");
  return <FilmsListing films={films} />;
}
