import { getStudioProjects } from "@/lib/api";
import { getStudioHeader, getHeaderImagePools } from "@/lib/landing";

export const dynamic = "force-dynamic";
import StudioListing from "./StudioListing";

export const metadata = {
  title: "Studio — Don't Skip Humanity",
  description: "Docuseries, videocasts, podcasts, and series — and the production and co-production capacity behind them.",
};

export default async function StudioPage() {
  /* The pools are every catalogue, not just this page's — a header may
     import film posters behind an Academy headline, and the editor should
     not need a developer for that. */
  const [projects, header, pools] = await Promise.all([
    getStudioProjects(),
    getStudioHeader(),
    getHeaderImagePools(),
  ]);
  return <StudioListing projects={projects} header={header} pools={pools} />;
}
