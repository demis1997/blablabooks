"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { INSTAGRAM_URL } from "@/lib/constants";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Instagram } from "@/components/brand/decorative";
import { ACCENT_FILL } from "./palette";
import { cn } from "@/lib/utils";
import type { BookAccent } from "./types";

const SPINES: Array<{ accent: BookAccent; tilt: number; height: string }> = [
  { accent: "blush", tilt: -8, height: "h-24" },
  { accent: "powder", tilt: -3, height: "h-20" },
  { accent: "butter", tilt: 2, height: "h-[4.5rem]" },
  { accent: "blush", tilt: 6, height: "h-14" },
  { accent: "powder", tilt: -5, height: "h-16" },
  { accent: "sage", tilt: 4, height: "h-[5.5rem]" },
  { accent: "lavender", tilt: 8, height: "h-[4.25rem]" },
];

export function FinalBookStack() {
  const t = useTranslations("Home");
  const tNav = useTranslations("Nav");
  const tFooter = useTranslations("Footer");

  return (
    <section className="mx-auto w-full max-w-3xl text-center">
      <div className="mb-8 flex items-end justify-center gap-1" aria-hidden>
        {SPINES.map((spine, i) => (
          <span
            key={`${spine.accent}-${i}`}
            className={cn(
              "book-cloth w-7 rounded-sm border border-ink/10 shadow-sm",
              ACCENT_FILL[spine.accent],
              spine.height,
            )}
            style={{ transform: `rotate(${spine.tilt}deg)` }}
          />
        ))}
      </div>
      <p className="font-display text-2xl italic text-ink sm:text-3xl">
        {t("seeYouNextChapter")}
      </p>
      <nav
        className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm"
        aria-label={t("closingNav")}
      >
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-ink underline decoration-blush/80 underline-offset-4"
        >
          <Instagram className="h-3.5 w-3.5" aria-hidden />
          {tNav("instagram")}
        </a>
        <Link
          href="/books"
          className="text-ink underline decoration-powder/80 underline-offset-4"
        >
          {tNav("books")}
        </Link>
        <Link
          href="/gallery"
          className="text-ink underline decoration-sage/80 underline-offset-4"
        >
          {tNav("gallery")}
        </Link>
        <Link
          href="/admin/login"
          className="text-ink-muted/80 underline-offset-4 hover:text-ink-muted hover:underline"
        >
          {tFooter("adminLogin")}
        </Link>
      </nav>
      <div className="mt-5 flex justify-center">
        <LanguageSwitcher />
      </div>
    </section>
  );
}
