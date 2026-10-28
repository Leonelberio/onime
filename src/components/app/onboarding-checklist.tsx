import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { LinkButton } from "@/components/ui";

type Props = {
  organizationName: string;
  boutiqueName: string;
  productCount: number;
  staffCount: number;
};

const TASKS = [
  { href: "/dashboard/stock", label: "Ajouter des produits ou scanner un code-barres", key: "stock" as const },
  { href: "/dashboard/equipe", label: "Inviter votre équipe (pointage)", key: "team" as const },
  { href: "/dashboard/pointage/reglages", label: "Configurer le GPS du pointage", key: "gps" as const },
  { href: "/dashboard/entreprise", label: "Personnaliser l'organisation et ajouter des boutiques", key: "org" as const },
];

export function OnboardingChecklist({ organizationName, boutiqueName, productCount, staffCount }: Props) {
  const done = {
    stock: productCount > 0,
    team: staffCount > 0,
    gps: false,
    org: false,
  };

  return (
    <section className="mb-8 rounded-card border border-[#44D600]/40 bg-[#44D600]/5 p-5">
      <h2 className="font-display text-lg font-bold">Premiers pas</h2>
      <p className="mt-1 text-body-sm text-muted-foreground">
        {organizationName} · boutique active : <strong className="text-foreground">{boutiqueName}</strong>
      </p>
      <ul className="mt-4 space-y-3">
        {TASKS.map((t) => {
          const isDone = done[t.key];
          return (
            <li key={t.href} className="flex items-start gap-3 text-body-sm">
              {isDone ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#44D600]" aria-hidden="true" />
              ) : (
                <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              )}
              <Link href={t.href} className="onime-link font-medium">
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-4">
        <LinkButton href="/dashboard/stock" variant="primary">
          Commencer par le stock
        </LinkButton>
      </div>
    </section>
  );
}
