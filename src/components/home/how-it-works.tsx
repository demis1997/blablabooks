import { getTranslations } from "next-intl/server";
import { BookMark, Flower, SpeechBubble } from "@/components/brand/decorative";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/lib/constants";

type HowItWorksProps = {
  locale: Locale;
};

const STEPS = [
  {
    key: "1" as const,
    Icon: BookMark,
    accent: "bg-blush/50",
  },
  {
    key: "2" as const,
    Icon: Flower,
    accent: "bg-powder/60",
  },
  {
    key: "3" as const,
    Icon: SpeechBubble,
    accent: "bg-sage/70",
  },
];

export async function HowItWorks({ locale }: HowItWorksProps) {
  const t = await getTranslations({ locale, namespace: "Home" });

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading title={t("howItWorks.title")} />
      <ol className="mt-10 grid gap-6 sm:grid-cols-3">
        {STEPS.map(({ key, Icon, accent }, index) => (
          <li
            key={key}
            className="relative rounded-3xl bg-paper/80 p-6 shadow-soft ring-1 ring-ink/5"
          >
            <div
              className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}
            >
              <Icon className="h-5 w-5 text-ink" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-2 font-display text-xl text-ink">
              {t(`howItWorks.step${key}Title`)}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              {t(`howItWorks.step${key}Body`)}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
