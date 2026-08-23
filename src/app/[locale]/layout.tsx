import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PageTurnTransition } from "@/components/book/page-turn-transition";
import { PublicExperience } from "@/components/providers/public-experience";
import { ToasterProvider } from "@/components/ui/toaster-provider";
import { routing } from "@/i18n/routing";
import { SITE_NAME } from "@/lib/constants";
import "../globals.css";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-source-sans",
  display: "swap",
});

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `/${l}`]),
  ) as Record<string, string>;

  return {
    title: {
      default: t("title"),
      template: `%s · ${SITE_NAME}`,
    },
    description: t("description"),
    keywords: t("keywords"),
    alternates: {
      languages: {
        ...languages,
        "x-default": `/${routing.defaultLocale}`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: SITE_NAME,
      locale: locale === "ru" ? "ru_RU" : "en_US",
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${sourceSans.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <PublicExperience>
            <SiteHeader />
            <main className="flex-1 w-full">
              <PageTurnTransition>{children}</PageTurnTransition>
            </main>
            <SiteFooter />
            <ToasterProvider />
          </PublicExperience>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
