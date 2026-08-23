"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { INSTAGRAM_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Instagram } from "@/components/brand/decorative";
import { Wordmark } from "@/components/brand/wordmark";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export type NavItem = {
  href: string;
  label: string;
};

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: NavItem[];
}

export function MobileNav({ open, onOpenChange, items }: MobileNavProps) {
  const t = useTranslations("Nav");

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-ink/40 transition-opacity motion-safe",
          open ? "opacity-100" : "opacity-0",
        )}
        aria-label={t("close")}
        onClick={() => onOpenChange(false)}
      />
      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label={t("menu")}
        className={cn(
          "absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col bg-paper shadow-soft transition-transform motion-safe",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <Wordmark showUnderline={false} className="text-lg" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("close")}
            onClick={() => onOpenChange(false)}
          >
            <X className="size-5" />
          </Button>
        </div>
        <Separator />
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-3 py-2.5 text-base font-medium text-ink transition-colors hover:bg-powder/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder"
              onClick={() => onOpenChange(false)}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-base font-medium text-ink transition-colors hover:bg-blush/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder"
            onClick={() => onOpenChange(false)}
          >
            <Instagram className="size-4" aria-hidden />
            {t("instagram")}
          </a>
        </nav>
        <div className="border-t border-ink/8 px-4 py-4">
          <LanguageSwitcher className="w-full justify-center" />
        </div>
      </div>
    </div>
  );
}
