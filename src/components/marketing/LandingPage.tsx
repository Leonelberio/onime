import { MarketingLanding } from "../../../design-system/marketing/MarketingLanding";
import { buildStockMarketingConfig, type LandingPlan } from "@/lib/marketing-landing";

export type { LandingPlan };

export function LandingPage({ plans }: { plans: LandingPlan[] }) {
  return <MarketingLanding config={buildStockMarketingConfig(plans)} />;
}
