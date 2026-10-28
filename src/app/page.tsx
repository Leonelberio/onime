import { redirect } from "next/navigation";
import { LandingPage } from "@/components/marketing/LandingPage";
import { getCurrentUser, homeFor } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const me = await getCurrentUser();
  if (me) redirect(homeFor(me.role));

  let plans: { id: string; name: string; priceMonthly: number; description: string | null }[] = [];
  try {
    plans = await db.plan.findMany({
      where: { active: true },
      orderBy: [{ position: "asc" }, { priceMonthly: "asc" }],
      take: 4,
    });
  } catch {
    /* base indisponible : tarifs de secours dans LandingPage */
  }

  return <LandingPage plans={plans} />;
}
