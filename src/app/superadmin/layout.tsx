import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { requireSuperadmin } from "@/lib/auth/session";
import { Badge } from "@/components/ui";
import { Logo } from "@/components/ui/logo";
import { AppNav, BottomNav, type NavItem } from "@/components/app/nav";

const NAV: NavItem[] = [
  { href: "/superadmin", label: "Vue d'ensemble", short: "Ensemble", icon: "home", exact: true },
  { href: "/superadmin/entreprises", label: "Entreprises", icon: "team" },
  { href: "/superadmin/plans", label: "Plans & tarifs", short: "Plans", icon: "billing" },
];

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireSuperadmin();
  return (
    <div className="mx-auto min-h-dvh w-full max-w-page px-4 pb-28 pt-3 lg:grid lg:pb-6 lg:grid-cols-[220px_1fr] lg:gap-8 lg:pt-6">
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="mb-3 flex items-center justify-between gap-3 lg:mb-6 lg:flex-col lg:items-start">
          <Logo href="/superadmin" />
          <div className="flex items-center gap-2">
            <Badge tone="primary">Super-admin</Badge>
            <form action={signOut} className="hidden lg:block">
              <button type="submit" className="onime-btn-icon" aria-label="Se déconnecter" title="Se déconnecter"><LogOut className="h-[18px] w-[18px]" aria-hidden="true" /></button>
            </form>
          </div>
        </div>
        <p className="mb-3 hidden truncate text-caption text-muted-foreground lg:block">{me.user.email}</p>
        <AppNav items={NAV} />
        <Link href="/" className="onime-link mt-4 hidden text-caption lg:inline-block">Voir le site</Link>
      </aside>
      <BottomNav items={NAV} moreLabel="Compte" moreIcon="account" sheetTitle="Mon compte">
        <p className="mb-2 truncate px-1 text-body-sm text-muted-foreground">{me.user.email}</p>
        <Link href="/" className="press-link mb-2 flex min-h-12 items-center rounded-button px-3 font-medium hover:bg-accent">Voir le site</Link>
        <form action={signOut}>
          <button type="submit" className="onime-btn onime-btn--secondary w-full !min-h-12"><LogOut className="h-[18px] w-[18px]" aria-hidden="true" />Se déconnecter</button>
        </form>
      </BottomNav>
      <main id="contenu" className="mt-4 min-w-0 lg:mt-0">{children}</main>
    </div>
  );
}
