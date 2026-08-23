"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface LanguageSwitcherProps {
  className?: string;
  size?: "default" | "sm";
}

export function LanguageSwitcher({
  className,
  size = "sm",
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: Locale) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-xl border border-ink/10 bg-paper/70 p-0.5",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      <Button
        type="button"
        variant={locale === "en" ? "soft" : "ghost"}
        size={size}
        className={cn(
          "min-w-[3.25rem] px-2",
          locale === "en" && "shadow-none",
        )}
        aria-pressed={locale === "en"}
        onClick={() => switchTo("en")}
      >
        <span aria-hidden>🇬🇧</span>
        <span>EN</span>
      </Button>
      <Button
        type="button"
        variant={locale === "ru" ? "soft" : "ghost"}
        size={size}
        className={cn(
          "min-w-[3.25rem] px-2",
          locale === "ru" && "shadow-none",
        )}
        aria-pressed={locale === "ru"}
        onClick={() => switchTo("ru")}
      >
        <span aria-hidden>🇷🇺</span>
        <span>RU</span>
      </Button>
    </div>
  );
}
