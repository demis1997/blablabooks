"use client";

import { useTranslations } from "next-intl";
import { PaperTexture } from "@/components/book/paper-texture";

type CatalogueShelfProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function CatalogueShelf({
  title,
  subtitle,
  children,
}: CatalogueShelfProps) {
  const t = useTranslations("Books");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="relative mx-auto mb-10 max-w-xl overflow-hidden rounded-md border border-ink/12 bg-paper px-6 py-5 shadow-[var(--shadow-soft)]">
        <PaperTexture className="opacity-[0.04]" />
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-2 bg-gradient-to-b from-blush via-powder to-sage"
        />
        <div className="relative pl-3">
          <p className="font-display text-[10px] uppercase tracking-[0.22em] text-ink-muted">
            {t("catalogueKicker")}
          </p>
          <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {subtitle}
          </p>
        </div>
      </header>
      <div
        aria-hidden
        className="mb-6 h-2 rounded-sm bg-gradient-to-b from-ink/10 to-transparent"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
