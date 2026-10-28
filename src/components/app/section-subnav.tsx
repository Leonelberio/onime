"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type SectionSubNavItem = { href: string; label: string; exact?: boolean };

export function SectionSubNav({ items }: { items: SectionSubNavItem[] }) {
  const path = usePathname();

  return (
    <nav aria-label="Sous-menu" className="-mt-2 mb-6 flex flex-wrap gap-2">
      {items.map((it) => {
        const active = it.exact ? path === it.href : path === it.href || path.startsWith(`${it.href}/`);
        return (
          <Link
            key={it.href}
            href={it.href}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "rounded-button px-3 py-2 text-body-sm font-medium transition-colors",
              active ? "bg-primary-soft text-primary-text" : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
