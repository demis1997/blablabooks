"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { INSTAGRAM_URL } from "@/lib/constants";
import { Instagram } from "@/components/brand/decorative";
import { Wordmark } from "@/components/brand/wordmark";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  const t = useTranslations("Nav");
  const tFooter = useTranslations("Footer");
  const year = new Date().getFullYear();

  const items = [
    { href: "/", label: t("home") },
    { href: "/books", label: t("books") },
    { href: "/gallery", label: t("gallery") },
    { href: "/about", label: t("about") },
    { href: "/randomizer", label: t("randomizer") },
  ] as const;

  return (
    <footer className="mt-auto border-t border-ink/8 bg-paper/50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Wordmark showUnderline />
            <p className="text-sm text-ink-muted">{tFooter("tagline")}</p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder rounded-sm"
            >
              <Instagram className="size-4" aria-hidden />
              {t("instagram")}
            </a>
          </div>

          <nav
            className="flex flex-wrap gap-x-4 gap-y-2"
            aria-label="Footer"
          >
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder rounded-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <LanguageSwitcher />
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-2 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{tFooter("rights", { year })}</p>
          <Link
            href="/admin/login"
            className="text-ink-muted/70 transition-colors hover:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder rounded-sm"
          >
            {tFooter("adminLogin")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
