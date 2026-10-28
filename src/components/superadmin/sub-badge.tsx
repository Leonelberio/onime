import { Badge } from "@/components/ui";
import { STATUS_LABEL, type SubscriptionState } from "@/lib/subscription";

export function SubBadge({ sub }: { sub: SubscriptionState }) {
  const tone = sub.status === "active" ? "success" : sub.status === "trial" ? "info" : sub.status === "expired" ? "caution" : "error";
  const extra = sub.status === "trial" ? ` · ${sub.trialDaysLeft} j` : sub.status === "active" ? ` · ${sub.subscriptionDaysLeft} j` : "";
  return <Badge tone={tone}>{STATUS_LABEL[sub.status]}{extra}</Badge>;
}
