"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { INSTAGRAM_URL } from "@/lib/constants";
import { Instagram } from "@/components/brand/decorative";
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

const emptySubscribe = () => () => {};

export function MobileNav({ open, onOpenChange, items }: MobileNavProps) {
  const t = useTranslations("Nav");
  const tBook = useTranslations("BookExperience");
  const reduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

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

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div
          key="mobile-nav"
          className="fixed inset-0 z-[200] lg:hidden"
          id="mobile-nav"
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-ink/45"
            aria-label={t("close")}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionTokens.duration.fast }}
            onClick={() => onOpenChange(false)}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t("menu")}
            className="absolute inset-y-0 right-0 flex h-[100dvh] w-[min(100%,20rem)] flex-col border-l border-ink/10 bg-paper pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-soft"
            initial={reduceMotion ? { x: 0 } : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduceMotion ? { x: "100%" } : { x: "100%" }}
            transition={{
              duration: motionTokens.duration.page * 0.55,
              ease: motionTokens.ease.paper,
            }}
          >
            <div
              aria-hidden
              className="paper-grain pointer-events-none absolute inset-0 opacity-[0.035]"
            />

            <div className="relative z-[1] flex shrink-0 items-center justify-between gap-3 border-b border-ink/8 px-4 py-4">
              <p className="font-display text-sm font-semibold tracking-wide text-ink">
                {tBook("contents")}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="min-h-11 min-w-11"
                aria-label={t("close")}
                onClick={() => onOpenChange(false)}
              >
                <X className="size-5" />
              </Button>
            </div>

            <nav className="relative z-[1] flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-4 py-5">
              {items.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-12 items-baseline gap-1 rounded-lg px-1 py-3 text-lg font-medium text-ink transition-colors hover:bg-powder/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder"
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
                className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-lg px-1 py-3 text-lg font-medium text-ink transition-colors hover:bg-blush/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder"
                onClick={() => onOpenChange(false)}
              >
                <Instagram className="size-4" aria-hidden />
                {t("instagram")}
              </a>
            </nav>

            <div className="relative z-[1] shrink-0 border-t border-ink/8 px-4 py-4">
              <LanguageSwitcher className="w-full justify-center" />
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
