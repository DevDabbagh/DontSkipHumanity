import { getFilms } from "@/lib/api";
import { getFilmsHeader, getHeaderImagePools } from "@/lib/landing";
import FilmsListing from "./FilmsListing";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Films — Don't Skip Humanity",
  description: "Documentary and fiction that stay close — to siege, displacement, and the daily labour of remaining human.",
};

export default async function FilmsPage() {
  /* The pools are every catalogue, not just this page's — a header may
     import film posters behind an Academy headline, and the editor should
     not need a developer for that. */
  const [films, header, pools] = await Promise.all([
    getFilms(),
    getFilmsHeader(),
    getHeaderImagePools(),
  ]);
  return <FilmsListing films={films} header={header} pools={pools} />;
}
