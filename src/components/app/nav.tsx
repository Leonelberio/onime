"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Clock,
  CreditCard,
  Ellipsis,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  User,
  Users,
  X,
} from "lucide-react";

const ICONS = {
  home: LayoutDashboard,
  clock: Clock,
  stock: Package,
  sales: ShoppingCart,
  purchases: ShoppingBag,
  team: Users,
  settings: Settings,
  billing: CreditCard,
};

export type NavSubItem = { href: string; label: string; exact?: boolean };

export type NavItem = {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  exact?: boolean;
  short?: string;
  children?: NavSubItem[];
};

const isActive = (it: NavItem | NavSubItem, path: string) =>
  it.exact ? path === it.href : path === it.href || path.startsWith(`${it.href}/`);

const inSection = (it: NavItem, path: string) =>
  path === it.href || path.startsWith(`${it.href}/`);

export function AppNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav aria-label="Navigation principale" className="hidden lg:block">
      <ul className="flex flex-col gap-1">
        {items.map((it) => {
          const active = isActive(it, path);
          const Icon = ICONS[it.icon];
          const showChildren = it.children?.length && inSection(it, path);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                prefetch={false}
                aria-current={active && !showChildren ? "page" : undefined}
                className={clsx(
                  "press-link flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-button px-3 py-2 text-body-sm font-medium transition-colors",
                  active ? "bg-primary-soft text-primary-text" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                {it.label}
              </Link>
              {showChildren ? (
                <ul className="mb-1 ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-3">
                  {it.children!.map((sub) => {
                    const subActive = isActive(sub, path);
                    return (
                      <li key={sub.href}>
                        <Link
                          href={sub.href}
                          prefetch={false}
                          aria-current={subActive ? "page" : undefined}
                          className={clsx(
                            "press-link block rounded-button px-2.5 py-1.5 text-body-sm transition-colors",
                            subActive ? "font-semibold text-primary-text" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                          )}
                        >
                          {sub.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function BottomNav({ items, more = [], moreLabel = "Plus", moreIcon = "more", sheetTitle = "Plus", children }: {
  items: NavItem[]; more?: NavItem[]; moreLabel?: string; moreIcon?: "more" | "account"; sheetTitle?: string; children?: React.ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const moreActive = more.some((it) => isActive(it, path));
  const MoreIcon = moreIcon === "account" ? User : Ellipsis;

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);

  const pill = "press relative flex min-h-14 w-full flex-col items-center justify-center gap-0.5 rounded-pill px-1 text-[11px] font-medium leading-none transition-colors";
  const on = "bg-primary text-primary-foreground font-semibold";
  const off = "text-muted-foreground hover:bg-accent hover:text-foreground";
  const cols = items.length + 1;

  return (
    <>
      <nav aria-label="Navigation principale" className="no-print fixed inset-x-3 bottom-3 z-30 rounded-card border border-border-hover bg-card p-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] lg:hidden">
        <ul className="mx-auto grid max-w-md gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {items.map((it) => {
            const active = isActive(it, path);
            const Icon = ICONS[it.icon];
            return (
              <li key={it.href}>
                <Link href={it.href} prefetch={false} aria-current={active ? "page" : undefined} className={clsx(pill, active ? on : off)}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="whitespace-nowrap">{it.short ?? it.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} aria-current={moreActive ? "page" : undefined} className={clsx(pill, moreActive ? on : off)}>
              <MoreIcon className="h-5 w-5" aria-hidden="true" />
              <span>{moreLabel}</span>
            </button>
          </li>
        </ul>
      </nav>

      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(e) => { if (e.target === dialog.current) setOpen(false); }}
        aria-labelledby="more-title"
        className="fixed inset-x-0 bottom-0 top-auto m-0 mx-auto max-h-[85dvh] w-full max-w-md rounded-b-none rounded-t-card border border-border-hover bg-popover p-0 text-foreground backdrop:bg-black/50 lg:hidden"
      >
        <div className="max-h-[85dvh] overflow-y-auto p-4 pb-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 id="more-title" className="font-display text-xl font-bold">{sheetTitle}</h2>
            <button type="button" className="onime-btn-icon !h-11 !w-11" aria-label="Fermer" onClick={() => setOpen(false)}><X className="h-5 w-5" aria-hidden="true" /></button>
          </div>
          {more.length > 0 && (
            <ul className="mb-3 grid gap-1">
              {more.map((it) => {
                const active = isActive(it, path);
                const Icon = ICONS[it.icon];
                return (
                  <li key={it.href}>
                    <Link href={it.href} prefetch={false} aria-current={active ? "page" : undefined} className={clsx("press-link flex min-h-12 items-center gap-3 rounded-button px-3 text-body font-medium transition-colors", active ? "bg-primary-soft text-primary-text" : "hover:bg-accent")}>
                      <Icon className="h-5 w-5" aria-hidden="true" />{it.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="border-t border-border pt-3">{children}</div>
        </div>
      </dialog>
    </>
  );
}
