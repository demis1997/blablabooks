"use client";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type BookmarkItem = {
  href: string;
  label: string;
};

type BookmarkNavProps = {
  items: BookmarkItem[];
  activeHref: string;
  className?: string;
};

export function BookmarkNav({ items, activeHref, className }: BookmarkNavProps) {
  function isActive(href: string) {
    if (href === "/") return activeHref === "/";
    return activeHref === href || activeHref.startsWith(`${href}/`);
  }

  return (
    <nav
      className={cn(
        "hidden items-end justify-center gap-1 lg:flex",
        className,
      )}
      aria-label="Primary"
    >
      {items.map((item, i) => {
        const active = isActive(item.href);
        const tones = [
          "bg-blush/70 hover:bg-blush",
          "bg-powder/70 hover:bg-powder",
          "bg-lavender/70 hover:bg-lavender",
          "bg-sage/70 hover:bg-sage",
          "bg-butter/70 hover:bg-butter",
        ] as const;
        const tone = tones[i % tones.length];

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "bookmark-tab font-display text-sm font-medium text-ink transition-transform duration-200",
              tone,
              active
                ? "translate-y-0 pb-3 pt-2 opacity-100 shadow-md"
                : "-translate-y-1 pb-2 pt-1.5 opacity-90 hover:-translate-y-2",
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
