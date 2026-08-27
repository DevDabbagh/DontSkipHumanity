import { getStudioProjects } from "@/lib/api";
import { getStudioHeader } from "@/lib/landing";

export const dynamic = "force-dynamic";
import StudioListing from "./StudioListing";

export const metadata = {
  title: "Studio — Don't Skip Humanity",
  description: "Docuseries, videocasts, podcasts, and series — and the production and co-production capacity behind them.",
};

export default async function StudioPage() {
  const [projects, header] = await Promise.all([getStudioProjects(), getStudioHeader()]);
  return <StudioListing projects={projects} header={header} />;
}
