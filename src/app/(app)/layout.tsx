import { signOut } from "@/lib/actions/auth";
import { requireStaff, staffHomeFor } from "@/lib/auth/session";
import type { Role } from "@prisma/client";
import { AppNav, BottomNav, type NavItem } from "@/components/app/nav";
import { BoutiqueSwitcher } from "@/components/app/boutique-switcher";
import { StaffMoneyProvider } from "@/components/app/staff-money-provider";
import { Alert } from "@/components/ui";
import { Logo } from "@/components/ui/logo";
import { LogOut } from "lucide-react";

const OWNER_NAV: NavItem[] = [
  { href: "/dashboard", label: "Accueil", icon: "home", exact: true },
  { href: "/dashboard/pointage", label: "Pointage", icon: "clock" },
  { href: "/dashboard/stock", label: "Stock", icon: "stock" },
  {
    href: "/dashboard/ventes",
    label: "Ventes",
    icon: "sales",
    children: [
      { href: "/dashboard/ventes", label: "Ventes", exact: true },
      { href: "/dashboard/ventes/clients", label: "Clients" },
    ],
  },
  {
    href: "/dashboard/achats",
    label: "Achats",
    icon: "purchases",
    children: [
      { href: "/dashboard/achats", label: "Achats", exact: true },
      { href: "/dashboard/achats/fournisseurs", label: "Fournisseurs" },
    ],
  },
  { href: "/dashboard/equipe", label: "Équipe", icon: "team" },
  { href: "/dashboard/entreprise", label: "Organisation", icon: "settings" },
];

const EMPLOYEE_NAV: NavItem[] = [
  { href: "/pointage", label: "Pointage", short: "Pointage", icon: "clock", exact: true },
];

function navFor(role: Role): NavItem[] {
  if (role === "OWNER") return OWNER_NAV;
  return EMPLOYEE_NAV;
}

const OWNER_BOTTOM = OWNER_NAV.slice(0, 4);
const OWNER_MORE = OWNER_NAV.slice(4);

function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="onime-btn onime-btn--secondary w-full !min-h-12"><LogOut className="h-[18px] w-[18px]" aria-hidden="true" />Se déconnecter</button>
    </form>
  );
}

function contextLabel(me: Awaited<ReturnType<typeof requireStaff>>) {
  if (me.viewMode === "consolidated") return `${me.organization.name} · Toutes les boutiques`;
  return me.boutique?.name ?? me.organization.name;
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await requireStaff();
  const { organization, subscription: sub, viewMode, boutiques, boutique } = me;
  const label = contextLabel(me);

  const bottomNav =
    me.role === "OWNER" ? (
      <BottomNav items={OWNER_BOTTOM} more={OWNER_MORE} sheetTitle="Plus">
        <p className="mb-2 truncate px-1 text-body-sm text-muted-foreground">{label}</p>
        <SignOutButton />
      </BottomNav>
    ) : (
      <BottomNav items={EMPLOYEE_NAV} moreLabel="Compte" moreIcon="account" sheetTitle="Mon compte">
        <p className="mb-2 truncate px-1 text-body-sm text-muted-foreground">{me.user.name} · {boutique?.name}</p>
        <SignOutButton />
      </BottomNav>
    );

  return (
    <div className="flex min-h-dvh w-full lg:h-dvh lg:max-h-dvh lg:min-h-0">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card px-5 py-6 lg:flex">
        <div className="mb-6 flex items-start justify-between gap-2">
          <Logo href={me.role === "OWNER" ? "/dashboard" : staffHomeFor(me.role)} />
          <form action={signOut}>
            <button type="submit" className="onime-btn-icon" aria-label="Se déconnecter" title="Se déconnecter">
              <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          </form>
        </div>
        <p className="mb-2 truncate text-body-sm font-semibold">{label}</p>
        {me.role === "OWNER" && (
          <div className="mb-4">
            <BoutiqueSwitcher boutiques={boutiques} viewMode={viewMode} activeBoutiqueId={boutique?.id ?? null} />
          </div>
        )}
        <AppNav items={navFor(me.role)} />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 lg:hidden">
          <Logo href={me.role === "OWNER" ? "/dashboard" : staffHomeFor(me.role)} compact />
          {me.role === "OWNER" && (
            <BoutiqueSwitcher boutiques={boutiques} viewMode={viewMode} activeBoutiqueId={boutique?.id ?? null} />
          )}
          <form action={signOut}>
            <button type="submit" className="onime-btn onime-btn--secondary !min-h-10 px-3 text-body-sm">Quitter</button>
          </form>
        </header>

        <main id="contenu" className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-4 sm:px-6 lg:px-10 lg:pb-8 lg:pt-8">
          <StaffMoneyProvider currency={organization.currency}>
            {sub.status === "suspended" && (
              <Alert tone="error" title="Accès suspendu" className="mb-5">
                Contactez l&apos;administrateur pour réactiver l&apos;accès.
              </Alert>
            )}
            {children}
          </StaffMoneyProvider>
        </main>
      </div>

      {bottomNav}
    </div>
  );
}
