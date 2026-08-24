import dynamic from "next/dynamic";
import { setRequestLocale } from "next-intl/server";
import { LibraryScene } from "@/components/library/library-scene";
import { HeroHardcover } from "@/components/library/hero-hardcover";
import { CurrentReadNovel } from "@/components/library/current-read-novel";
import { MeetupDiary } from "@/components/library/meetup-diary";
import { MiniBookStack } from "@/components/library/mini-book-stack";
import { getCurrentBook, getCandidateBooks } from "@/lib/data/books";
import { getPublishedAnnouncements } from "@/lib/data/announcements";
import { listGalleryImages } from "@/lib/data/gallery";
import { getSiteSettings } from "@/lib/data/settings";
import { pickAnnouncementBanner, pickNextMeetup } from "@/lib/meetups";
import { AnnouncementBanner } from "@/components/home/announcement-banner";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/constants";

const GalleryAlbum = dynamic(() =>
  import("@/components/library/gallery-album").then((m) => m.GalleryAlbum),
);
const InstagramZine = dynamic(() =>
  import("@/components/library/instagram-zine").then((m) => m.InstagramZine),
);
const FinalBookStack = dynamic(() =>
  import("@/components/library/final-book-stack").then((m) => m.FinalBookStack),
);

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

  const nextMeetup = pickNextMeetup(announcements);
  const banner = pickAnnouncementBanner(announcements);

  return (
    <LibraryScene>
      {banner ? (
        <AnnouncementBanner announcement={banner} locale={locale} />
      ) : null}
      <HeroHardcover currentBook={currentBook} candidateBooks={candidates} />
      {currentBook ? (
        <CurrentReadNovel book={currentBook} locale={locale} />
      ) : null}
      {nextMeetup ? (
        <MeetupDiary announcement={nextMeetup} locale={locale} />
      ) : null}
      <MiniBookStack />
      <GalleryAlbum images={gallery} locale={locale} />
      <InstagramZine href={settings.instagram_url} photos={gallery} />
      <FinalBookStack />
    </LibraryScene>
  );
}
