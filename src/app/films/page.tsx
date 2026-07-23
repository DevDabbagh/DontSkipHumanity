import { getFilms } from "@/lib/api";
import FilmsListing from "./FilmsListing";

export const metadata = {
  title: "Films — Don't Skip Humanity",
  description: "Documentary and fiction that stay close — to siege, displacement, and the daily labour of remaining human.",
};

export default async function FilmsPage() {
  const films = await getFilms();
  return <FilmsListing films={films} />;
}
