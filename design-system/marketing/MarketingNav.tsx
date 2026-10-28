"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { MarketingNavItem } from "./types";

function sectionId(href: string) {
  return href.startsWith("#") ? href.slice(1) : null;
}

export function MarketingNav({ items }: { items: MarketingNavItem[] }) {
  const [activeHref, setActiveHref] = useState(items.find((i) => i.current)?.href ?? items[0]?.href ?? "#contenu");

  useEffect(() => {
    const ids = items.map((i) => sectionId(i.href)).filter(Boolean) as string[];
    const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    const syncFromScroll = () => {
      const probe = window.scrollY + 120;
      let current = items[0]?.href ?? "#contenu";
      for (const item of items) {
        const id = sectionId(item.href);
        if (!id) continue;
        const el = document.getElementById(id);
        if (el && el.offsetTop <= probe) current = item.href;
      }
      setActiveHref(current);
    };

    const observer = new IntersectionObserver(
      () => syncFromScroll(),
      { root: null, rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.1, 0.25] },
    );
    for (const el of sections) observer.observe(el);
    syncFromScroll();
    window.addEventListener("scroll", syncFromScroll, { passive: true });
    window.addEventListener("hashchange", syncFromScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", syncFromScroll);
      window.removeEventListener("hashchange", syncFromScroll);
    };
  }, [items]);

  return (
    <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
      {items.map((item) => {
        const active = activeHref === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "marketing-nav-link rounded-pill px-4 py-2 text-body-sm transition-colors",
              active
                ? "marketing-nav-link--active font-semibold"
                : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
