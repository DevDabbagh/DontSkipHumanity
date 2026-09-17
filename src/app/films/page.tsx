import { getFilms } from "@/lib/api";
import { getFilmsHeader, getHeaderImagePools } from "@/lib/landing";
import { getFilmForms } from "@/lib/film-forms-server";
import { getLocales } from "@/lib/i18n";
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
  const [films, header, pools, forms, locales] = await Promise.all([
    getFilms(),
    getFilmsHeader(),
    getHeaderImagePools(),
    // Fetched here rather than in the listing: the listing is a client
    // component, and the forms decide a label and a colour that the server
    // can resolve once instead of every browser resolving them again.
    getFilmForms(),
    getLocales(),
  ]);

  const defaultLocale = (locales.find((l) => l.isDefault) ?? locales[0])?.code ?? "en";

  return (
    <FilmsListing
      films={films}
      header={header}
      pools={pools}
      forms={forms}
      locale={defaultLocale}
      defaultLocale={defaultLocale}
    />
  );
}
