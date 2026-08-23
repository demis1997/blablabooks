"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { INSTAGRAM_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Instagram } from "@/components/brand/decorative";
import { Wordmark } from "@/components/brand/wordmark";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MobileNav, type NavItem } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items: NavItem[] = [
    { href: "/", label: t("home") },
    { href: "/books", label: t("books") },
    { href: "/gallery", label: t("gallery") },
    { href: "/about", label: t("about") },
    { href: "/randomizer", label: t("randomizer") },
  ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink/8 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Wordmark />

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Primary"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
                isActive(item.href)
                  ? "bg-powder/50 text-ink"
                  : "text-ink-muted hover:bg-ink/5 hover:text-ink",
              )}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-lg p-2 text-ink-muted transition-colors hover:bg-blush/40 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder sm:inline-flex"
            aria-label={t("instagram")}
          >
            <Instagram className="size-5" />
          </a>
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={t("menu")}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      <MobileNav
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        items={items}
      />
    </header>
  );
}
