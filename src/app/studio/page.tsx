import { MOCK_STUDIO } from "@/lib/mock-data";
import StudioListing from "./StudioListing";

export const metadata = {
  title: "Studio — Don't Skip Humanity",
  description: "Docuseries, videocasts, podcasts, and series — and the production and co-production capacity behind them.",
};

export default function StudioPage() {
  return <StudioListing projects={MOCK_STUDIO} />;
}
