import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Instagram } from "@/components/brand/decorative";
import { INSTAGRAM_URL } from "@/lib/constants";
import type { Locale } from "@/lib/constants";

type InstagramCtaProps = {
  locale: Locale;
  href?: string;
};

export async function InstagramCta({
  locale,
  href = INSTAGRAM_URL,
}: InstagramCtaProps) {
  const t = await getTranslations({ locale, namespace: "Home" });

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blush/50 via-paper to-powder/40 px-6 py-12 text-center shadow-soft ring-1 ring-ink/5 sm:px-12 sm:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-8 top-6 h-28 w-28 rounded-full bg-butter/50 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 bottom-4 h-32 w-32 rounded-full bg-lavender/40 blur-2xl"
        />
        <h2 className="relative font-display text-3xl text-ink sm:text-4xl">
          {t("instagramCta.title")}
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-base text-ink-muted">
          {t("instagramCta.body")}
        </p>
        <div className="relative mt-8">
          <Button asChild size="lg" variant="secondary">
            <a href={href} target="_blank" rel="noopener noreferrer">
              <Instagram className="h-4 w-4" />
              {t("instagramCta.button")}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
