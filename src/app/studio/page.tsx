import { getStudioProjects } from "@/lib/api";
import StudioListing from "./StudioListing";

export const metadata = {
  title: "Studio — Don't Skip Humanity",
  description: "Docuseries, videocasts, podcasts, and series — and the production and co-production capacity behind them.",
};

export default async function StudioPage() {
  const projects = await getStudioProjects();
  return <StudioListing projects={projects} />;
}
