import { setRequestLocale } from "next-intl/server";
import { BookShell } from "@/components/book/book-shell";
import { HomeHero } from "@/components/home/home-hero";
import { CurrentBookSection } from "@/components/home/current-book-section";
import { MeetupCard } from "@/components/home/meetup-card";
import { HowItWorks } from "@/components/home/how-it-works";
import { GalleryPreview } from "@/components/home/gallery-preview";
import { InstagramCta } from "@/components/home/instagram-cta";
import { getCurrentBook, getCandidateBooks } from "@/lib/data/books";
import { getPublishedAnnouncements } from "@/lib/data/announcements";
import { listGalleryImages } from "@/lib/data/gallery";
import { getSiteSettings } from "@/lib/data/settings";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/constants";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const [currentBook, candidates, announcements, gallery, settings] =
    await Promise.all([
      getCurrentBook(),
      getCandidateBooks(),
      getPublishedAnnouncements(),
      listGalleryImages(),
      getSiteSettings(),
    ]);

  const nextMeetup =
    announcements.find((a) => a.announcement_type === "meetup") ??
    announcements[0] ??
    null;

  return (
    <BookShell className="pt-4 sm:pt-6">
      <div className="flex flex-col">
        <HomeHero currentBook={currentBook} candidateBooks={candidates} />
        {currentBook ? (
          <CurrentBookSection book={currentBook} locale={locale} />
        ) : null}
        {nextMeetup ? (
          <MeetupCard announcement={nextMeetup} locale={locale} />
        ) : null}
        <HowItWorks />
        <GalleryPreview images={gallery} locale={locale} />
        <InstagramCta href={settings.instagram_url} />
      </div>
    </BookShell>
  );
}
