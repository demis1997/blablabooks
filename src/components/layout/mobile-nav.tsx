"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { INSTAGRAM_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Instagram } from "@/components/brand/decorative";
import { Wordmark } from "@/components/brand/wordmark";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import { motionTokens } from "@/lib/motion/tokens";

export type NavItem = {
  href: string;
  label: string;
};

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: NavItem[];
}

const DECORATIVE_PAGES = ["03", "07", "11", "15", "19", "23", "27"] as const;

export function MobileNav({ open, onOpenChange, items }: MobileNavProps) {
  const t = useTranslations("Nav");
  const tBook = useTranslations("BookExperience");
  const reduceMotion = useReducedMotion();

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
      <AnimatePresence>
        {open ? (
          <motion.button
            key="backdrop"
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label={t("close")}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionTokens.duration.fast }}
            onClick={() => onOpenChange(false)}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="panel"
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label={t("menu")}
            className="absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col overflow-hidden border-l border-ink/10 bg-paper shadow-soft"
            initial={
              reduceMotion
                ? { x: 0 }
                : { x: "100%", rotate: 1.5, transformOrigin: "right center" }
            }
            animate={{ x: 0, rotate: 0 }}
            exit={
              reduceMotion
                ? { x: "100%" }
                : { x: "100%", rotate: 1.5, transformOrigin: "right center" }
            }
            transition={{
              duration: motionTokens.duration.page * 0.7,
              ease: motionTokens.ease.paper,
            }}
          >
            <div
              aria-hidden
              className="paper-grain pointer-events-none absolute inset-0 opacity-[0.035]"
            />

            <div className="relative z-[1] flex items-center justify-between gap-3 border-b border-ink/8 px-4 py-4">
              <div>
                <p className="font-display text-xs font-semibold tracking-wide text-ink-muted">
                  {tBook("contents")}
                </p>
                <Wordmark showUnderline={false} className="mt-1 text-lg" />
              </div>
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

            <nav className="relative z-[1] flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-5">
              {items.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-baseline gap-1 rounded-lg px-1 py-2.5 text-base font-medium text-ink transition-colors hover:bg-powder/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder"
                  onClick={() => onOpenChange(false)}
                >
                  <span className="font-display shrink-0">{item.label}</span>
                  <span className="contents-leader" aria-hidden />
                  <span
                    className="shrink-0 font-display text-sm tabular-nums text-ink-muted"
                    aria-hidden
                  >
                    {DECORATIVE_PAGES[index] ??
                      String((index + 1) * 4).padStart(2, "0")}
                  </span>
                </Link>
              ))}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 rounded-lg px-1 py-2.5 text-base font-medium text-ink transition-colors hover:bg-blush/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder"
                onClick={() => onOpenChange(false)}
              >
                <Instagram className="size-4" aria-hidden />
                {t("instagram")}
              </a>
            </nav>

            <div className="relative z-[1] border-t border-ink/8 px-4 py-4">
              <LanguageSwitcher className="w-full justify-center" />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
