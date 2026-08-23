import type {
  ActivityLog,
  Announcement,
  Book,
  EditablePage,
  GalleryImage,
  ImportRecord,
  MonthlyDraw,
  SiteSettings,
} from "@/types/database";
import { INSTAGRAM_URL, SITE_NAME } from "@/lib/constants";
import { normalizeAuthors, normalizeTitle } from "@/lib/books/normalize";

const nowIso = () => new Date().toISOString();

function book(partial: Omit<Book, "normalized_title" | "normalized_authors"> & {
  normalized_title?: string;
  normalized_authors?: string;
}): Book {
  return {
    ...partial,
    normalized_title:
      partial.normalized_title ?? normalizeTitle(partial.title),
    normalized_authors:
      partial.normalized_authors ?? normalizeAuthors(partial.authors),
  };
}

export const DEMO_BOOKS: Book[] = [
  book({
    id: "11111111-1111-4111-8111-111111111101",
    title: "Example: The Midnight Library",
    subtitle: "Demo currently-reading title",
    authors: ["Matt Haig"],
    page_count: 304,
    description:
      "EXAMPLE BOOK — Between life and death there is a library. Demo data for Bla Bla Books when Supabase is offline.",
    description_ru:
      "ПРИМЕР — Между жизнью и смертью есть библиотека. Демо-данные Bla Bla Books.",
    isbn_10: "0525559477",
    isbn_13: "9780525559474",
    first_publish_year: 2020,
    edition_publish_year: 2020,
    language: "eng",
    subjects: ["Fiction", "Fantasy", "Parallel universes"],
    open_library_work_key: "/works/OL20885634W",
    open_library_edition_key: "/books/OL28176302M",
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/id/10523339-M.jpg",
    custom_cover_path: null,
    status: "currently_reading",
    selected_month: 8,
    selected_year: 2026,
    club_note: "This is demo “currently reading” data — not a live club pick.",
    club_note_ru: "Это демо «сейчас читаем» — не реальный выбор клуба.",
    is_archived: false,
    date_added: "2026-07-01",
    created_at: "2026-07-01T10:00:00.000Z",
    updated_at: "2026-08-01T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111201",
    title: "Atomic Habits",
    subtitle: "An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    authors: ["James Clear"],
    page_count: 320,
    description: "A practical framework for building better habits.",
    description_ru: "Практический подход к формированию полезных привычек.",
    isbn_10: "0735211299",
    isbn_13: "9780735211292",
    first_publish_year: 2018,
    edition_publish_year: 2018,
    language: "eng",
    subjects: ["Self-help", "Habits", "Psychology"],
    open_library_work_key: "/works/OL19964198W",
    open_library_edition_key: "/books/OL27349122M",
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/id/8754492-M.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: null,
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-06-12",
    created_at: "2026-06-12T09:00:00.000Z",
    updated_at: "2026-06-12T09:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111202",
    title: "Project Hail Mary",
    subtitle: null,
    authors: ["Andy Weir"],
    page_count: 476,
    description: "A lone astronaut must save Earth from disaster.",
    description_ru: "Одинокий астронавт должен спасти Землю.",
    isbn_10: "0593135202",
    isbn_13: "9780593135204",
    first_publish_year: 2021,
    edition_publish_year: 2021,
    language: "eng",
    subjects: ["Science fiction", "Space"],
    open_library_work_key: "/works/OL21637224W",
    open_library_edition_key: "/books/OL29589033M",
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/id/10521272-M.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: null,
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-06-15",
    created_at: "2026-06-15T11:00:00.000Z",
    updated_at: "2026-06-15T11:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111203",
    title: "Klara and the Sun",
    subtitle: null,
    authors: ["Kazuo Ishiguro"],
    page_count: 303,
    description: "An Artificial Friend observes the world with quiet devotion.",
    description_ru: "Искусственный друг наблюдает за миром с тихой преданностью.",
    isbn_10: "059331817X",
    isbn_13: "9780593318171",
    first_publish_year: 2021,
    edition_publish_year: 2021,
    language: "eng",
    subjects: ["Literary fiction", "Science fiction"],
    open_library_work_key: "/works/OL20813708W",
    open_library_edition_key: "/books/OL29848270M",
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/id/10521240-M.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: null,
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-06-18",
    created_at: "2026-06-18T08:30:00.000Z",
    updated_at: "2026-06-18T08:30:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111204",
    title: "The House in the Cerulean Sea",
    subtitle: null,
    authors: ["TJ Klune"],
    page_count: 398,
    description: "A caseworker visits an orphanage for magical children.",
    description_ru: "Инспектор посещает приют для волшебных детей.",
    isbn_10: "1250217288",
    isbn_13: "9781250217288",
    first_publish_year: 2020,
    edition_publish_year: 2020,
    language: "eng",
    subjects: ["Fantasy", "LGBTQ+", "Found family"],
    open_library_work_key: "/works/OL20820888W",
    open_library_edition_key: "/books/OL28175586M",
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/id/10319208-M.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: null,
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-06-20",
    created_at: "2026-06-20T14:00:00.000Z",
    updated_at: "2026-06-20T14:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111205",
    title: "Educated",
    subtitle: "A Memoir",
    authors: ["Tara Westover"],
    page_count: 334,
    description: "A memoir of leaving home to pursue education.",
    description_ru: "Мемуары о пути к образованию.",
    isbn_10: "0399590501",
    isbn_13: "9780399590504",
    first_publish_year: 2018,
    edition_publish_year: 2018,
    language: "eng",
    subjects: ["Memoir", "Education"],
    open_library_work_key: "/works/OL19650254W",
    open_library_edition_key: "/books/OL26964722M",
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/id/8315242-M.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: null,
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-06-22",
    created_at: "2026-06-22T16:00:00.000Z",
    updated_at: "2026-06-22T16:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111206",
    title: "Piranesi",
    subtitle: null,
    authors: ["Susanna Clarke"],
    page_count: 245,
    description: "A man lives in an infinite house of statues and tides.",
    description_ru: "Человек живёт в бесконечном доме статуй и приливов.",
    isbn_10: "163557563X",
    isbn_13: "9781635575637",
    first_publish_year: 2020,
    edition_publish_year: 2020,
    language: "eng",
    subjects: ["Fantasy", "Literary fiction"],
    open_library_work_key: "/works/OL20813723W",
    open_library_edition_key: "/books/OL28645864M",
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/id/10521241-M.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: null,
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-06-25",
    created_at: "2026-06-25T10:00:00.000Z",
    updated_at: "2026-06-25T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111301",
    title: "1984",
    subtitle: null,
    authors: ["George Orwell"],
    page_count: 328,
    description: "A classic dystopia previously discussed by the club (demo).",
    description_ru: "Классическая антиутопия, ранее обсуждавшаяся клубом (демо).",
    isbn_10: "0451524934",
    isbn_13: "9780451524935",
    first_publish_year: 1949,
    edition_publish_year: 1961,
    language: "eng",
    subjects: ["Dystopia", "Classics"],
    open_library_work_key: "/works/OL1168083W",
    open_library_edition_key: "/books/OL7353617M",
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/id/7222246-M.jpg",
    custom_cover_path: null,
    status: "previously_read",
    selected_month: 5,
    selected_year: 2026,
    club_note: "May 2026 demo pick.",
    club_note_ru: "Демо-выбор мая 2026.",
    is_archived: false,
    date_added: "2026-04-01",
    created_at: "2026-04-01T09:00:00.000Z",
    updated_at: "2026-05-31T09:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111302",
    title: "Pride and Prejudice",
    subtitle: null,
    authors: ["Jane Austen"],
    page_count: 279,
    description: "A beloved romance previously discussed by the club (demo).",
    description_ru: "Любимый роман, ранее обсуждавшийся клубом (демо).",
    isbn_10: "0141439513",
    isbn_13: "9780141439518",
    first_publish_year: 1813,
    edition_publish_year: 2002,
    language: "eng",
    subjects: ["Romance", "Classics"],
    open_library_work_key: "/works/OL66554W",
    open_library_edition_key: "/books/OL7353618M",
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/id/8091016-M.jpg",
    custom_cover_path: null,
    status: "previously_read",
    selected_month: 4,
    selected_year: 2026,
    club_note: "April 2026 demo pick.",
    club_note_ru: "Демо-выбор апреля 2026.",
    is_archived: false,
    date_added: "2026-03-01",
    created_at: "2026-03-01T09:00:00.000Z",
    updated_at: "2026-04-30T09:00:00.000Z",
    created_by: null,
  }),
];

export const DEMO_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "22222222-2222-4222-8222-222222222201",
    title_en: "September meetup — Limassol waterfront",
    title_ru: "Сентябрьская встреча — набережная Лимассола",
    description_en:
      "Join us to discuss this month’s book over coffee. New members welcome — look for the Bla Bla Books sign.",
    description_ru:
      "Присоединяйтесь обсудить книгу месяца за кофе. Новички приветствуются — ищите табличку Bla Bla Books.",
    announcement_type: "meetup",
    event_date: "2026-09-20",
    start_time: "18:00",
    end_time: "20:00",
    venue: "Coffee Island (demo)",
    address: "Limassol Marina, Cyprus",
    maps_url: "https://maps.google.com/?q=Limassol+Marina",
    image_url: null,
    publish_at: "2026-08-01T08:00:00.000Z",
    expires_at: "2026-09-21T00:00:00.000Z",
    is_pinned: true,
    status: "published",
    hide_when_expired: true,
    created_at: "2026-07-28T12:00:00.000Z",
    updated_at: "2026-07-28T12:00:00.000Z",
    created_by: null,
  },
];

export const DEMO_GALLERY: GalleryImage[] = [
  {
    id: "33333333-3333-4333-8333-333333333301",
    event_id: null,
    storage_path: "seed/gallery-1.svg",
    optimized_path: null,
    public_url: "/seed/gallery-1.svg",
    caption_en: "Spring meetup (demo)",
    caption_ru: "Весенняя встреча (демо)",
    alt_text: "Book club meetup placeholder illustration",
    event_date: "2026-04-12",
    location: "Nicosia",
    sort_order: 0,
    is_featured: true,
    status: "published",
    width: 800,
    height: 600,
    created_at: "2026-04-13T10:00:00.000Z",
    updated_at: "2026-04-13T10:00:00.000Z",
    uploaded_by: null,
  },
  {
    id: "33333333-3333-4333-8333-333333333302",
    event_id: null,
    storage_path: "seed/gallery-2.svg",
    optimized_path: null,
    public_url: "/seed/gallery-2.svg",
    caption_en: "May discussion circle",
    caption_ru: "Майский круг обсуждения",
    alt_text: "Discussion circle placeholder",
    event_date: "2026-05-10",
    location: "Limassol",
    sort_order: 1,
    is_featured: false,
    status: "published",
    width: 800,
    height: 600,
    created_at: "2026-05-11T10:00:00.000Z",
    updated_at: "2026-05-11T10:00:00.000Z",
    uploaded_by: null,
  },
  {
    id: "33333333-3333-4333-8333-333333333303",
    event_id: null,
    storage_path: "seed/gallery-3.svg",
    optimized_path: null,
    public_url: "/seed/gallery-3.svg",
    caption_en: "Books on the table",
    caption_ru: "Книги на столе",
    alt_text: "Stack of books placeholder",
    event_date: "2026-06-08",
    location: "Larnaca",
    sort_order: 2,
    is_featured: false,
    status: "published",
    width: 800,
    height: 600,
    created_at: "2026-06-09T10:00:00.000Z",
    updated_at: "2026-06-09T10:00:00.000Z",
    uploaded_by: null,
  },
  {
    id: "33333333-3333-4333-8333-333333333304",
    event_id: null,
    storage_path: "seed/gallery-4.svg",
    optimized_path: null,
    public_url: "/seed/gallery-4.svg",
    caption_en: "Summer evening meetup",
    caption_ru: "Летняя вечерняя встреча",
    alt_text: "Evening meetup placeholder",
    event_date: "2026-07-12",
    location: "Paphos",
    sort_order: 3,
    is_featured: true,
    status: "published",
    width: 800,
    height: 600,
    created_at: "2026-07-13T10:00:00.000Z",
    updated_at: "2026-07-13T10:00:00.000Z",
    uploaded_by: null,
  },
];

const DEMO_SETTINGS: SiteSettings = {
  id: "44444444-4444-4444-8444-444444444401",
  public_randomizer_enabled: true,
  instagram_url: INSTAGRAM_URL,
  logo_url: null,
  site_name: SITE_NAME,
  default_locale: "en",
  updated_at: "2026-08-01T00:00:00.000Z",
};

const DEMO_ABOUT: EditablePage = {
  id: "55555555-5555-4555-8555-555555555501",
  slug: "about",
  title_en: "About Bla Bla Books",
  title_ru: "О Bla Bla Books",
  content_en: `## What is Bla Bla Books?

Bla Bla Books is a community book club in Cyprus for people who love reading and talking about books — in English, Russian, or both.

## Our community

We welcome English-speaking and Russian-speaking readers. Meetings are friendly and informal: bring the month’s book (or your curiosity) and join the conversation.

## How meetings work

Books are suggested by members, one title is selected for the month, and we meet to discuss it. Details for each meetup are shared on this site and on Instagram.

## Who can join

Anyone in Cyprus who enjoys books is welcome. Follow us on Instagram to stay in the loop and say hello.

## Locations

We meet in venues across Cyprus. Check the latest meetup announcement for the current place and time.

*(Demo content — configure Supabase for live edits.)*`,
  content_ru: `## Что такое Bla Bla Books?

Bla Bla Books — это книжный клуб на Кипре для тех, кто любит читать и обсуждать книги — на английском, русском или на обоих языках.

## Наше сообщество

Мы рады англоязычным и русскоязычным читателям. Встречи тёплые и неформальные: приходите с книгой месяца (или просто с интересом) и присоединяйтесь к разговору.

## Как проходят встречи

Участники предлагают книги, одна выбирается на месяц, и мы встречаемся, чтобы её обсудить. Подробности каждой встречи публикуются на сайте и в Instagram.

## Кто может присоединиться

Любой на Кипре, кому нравятся книги. Подписывайтесь на Instagram, чтобы быть в курсе и поздороваться.

## Локации

Мы встречаемся в разных местах на Кипре. Актуальный адрес и время — в анонсе ближайшей встречи.

*(Демо-контент — подключите Supabase для живого редактирования.)*`,
  updated_at: "2026-08-01T00:00:00.000Z",
  updated_by: null,
};

const DEMO_DRAWS: MonthlyDraw[] = [
  {
    id: "66666666-6666-4666-8666-666666666601",
    month: 5,
    year: 2026,
    status: "confirmed",
    selected_book_id: "11111111-1111-4111-8111-111111111301",
    eligible_book_ids: [
      "11111111-1111-4111-8111-111111111301",
      "11111111-1111-4111-8111-111111111302",
    ],
    excluded_book_ids: [],
    confirmed_at: "2026-05-01T12:00:00.000Z",
    admin_id: null,
    notes: "Demo confirmed draw",
    created_at: "2026-05-01T11:00:00.000Z",
    updated_at: "2026-05-01T12:00:00.000Z",
  },
];

const DEMO_ACTIVITY: ActivityLog[] = [
  {
    id: "77777777-7777-4777-8777-777777777701",
    admin_id: null,
    action: "seed.demo",
    entity_type: "system",
    entity_id: null,
    details: { message: "Loaded in-memory demo dataset" },
    created_at: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "77777777-7777-4777-8777-777777777702",
    admin_id: null,
    action: "book.status_changed",
    entity_type: "book",
    entity_id: "11111111-1111-4111-8111-111111111101",
    details: { status: "currently_reading" },
    created_at: "2026-08-01T10:00:00.000Z",
  },
];

export type DemoStore = {
  books: Book[];
  announcements: Announcement[];
  gallery: GalleryImage[];
  settings: SiteSettings;
  pages: EditablePage[];
  draws: MonthlyDraw[];
  activity: ActivityLog[];
  imports: ImportRecord[];
};

function createInitialStore(): DemoStore {
  return {
    books: structuredClone(DEMO_BOOKS),
    announcements: structuredClone(DEMO_ANNOUNCEMENTS),
    gallery: structuredClone(DEMO_GALLERY),
    settings: structuredClone(DEMO_SETTINGS),
    pages: [structuredClone(DEMO_ABOUT)],
    draws: structuredClone(DEMO_DRAWS),
    activity: structuredClone(DEMO_ACTIVITY),
    imports: [],
  };
}

/** Mutable in-memory store for admin demo mutations. */
let store: DemoStore = createInitialStore();

export function getDemoStore(): DemoStore {
  return store;
}

export function resetDemoStore(): void {
  store = createInitialStore();
}

export function mutateDemoStore(mutator: (draft: DemoStore) => void): DemoStore {
  mutator(store);
  return store;
}

export function getDemoBooks(): Book[] {
  return store.books;
}

export function getDemoCurrentBook(): Book | null {
  return (
    store.books.find(
      (b) => b.status === "currently_reading" && !b.is_archived,
    ) ?? null
  );
}

export function getDemoAnnouncement(): Announcement | null {
  return store.announcements[0] ?? null;
}

export function getDemoAnnouncements(): Announcement[] {
  return store.announcements;
}

export function getDemoGallery(): GalleryImage[] {
  return store.gallery;
}

export function getDemoSettings(): SiteSettings {
  return store.settings;
}

export function getDemoAboutPage(): EditablePage {
  return store.pages.find((p) => p.slug === "about") ?? store.pages[0]!;
}

export function getDemoPages(): EditablePage[] {
  return store.pages;
}

export function getDemoDraws(): MonthlyDraw[] {
  return store.draws;
}

export function getDemoActivity(): ActivityLog[] {
  return store.activity;
}

export function appendDemoActivity(
  entry: Omit<ActivityLog, "id" | "created_at"> & {
    id?: string;
    created_at?: string;
  },
): ActivityLog {
  const log: ActivityLog = {
    id: entry.id ?? crypto.randomUUID(),
    admin_id: entry.admin_id,
    action: entry.action,
    entity_type: entry.entity_type,
    entity_id: entry.entity_id,
    details: entry.details,
    created_at: entry.created_at ?? nowIso(),
  };
  store.activity = [log, ...store.activity];
  return log;
}

export function addActivity(
  entry: Omit<ActivityLog, "id" | "created_at"> & {
    id?: string;
    created_at?: string;
  },
): ActivityLog {
  return appendDemoActivity(entry);
}

export function getDemoImports(): ImportRecord[] {
  return store.imports;
}

export function setBooks(books: Book[]): void {
  mutateDemoStore((draft) => {
    draft.books = books;
  });
}

export function upsertBook(book: Book): Book {
  const now = nowIso();
  let saved = book;
  mutateDemoStore((draft) => {
    const index = draft.books.findIndex((b) => b.id === book.id);
    const next: Book = {
      ...book,
      normalized_title: normalizeTitle(book.title),
      normalized_authors: normalizeAuthors(book.authors),
      updated_at: now,
    };
    if (index === -1) {
      draft.books = [next, ...draft.books];
    } else {
      draft.books[index] = { ...draft.books[index]!, ...next };
    }
    saved = draft.books[index === -1 ? 0 : index]!;
  });
  return saved;
}

export function deleteBook(id: string): boolean {
  let removed = false;
  mutateDemoStore((draft) => {
    const before = draft.books.length;
    draft.books = draft.books.filter((b) => b.id !== id);
    removed = draft.books.length < before;
  });
  return removed;
}

export function addDraw(draw: MonthlyDraw): MonthlyDraw {
  mutateDemoStore((draft) => {
    draft.draws = [draw, ...draft.draws];
  });
  return draw;
}

export function upsertAnnouncement(announcement: Announcement): Announcement {
  const now = nowIso();
  let saved = announcement;
  mutateDemoStore((draft) => {
    const index = draft.announcements.findIndex((a) => a.id === announcement.id);
    const next = { ...announcement, updated_at: now };
    if (index === -1) {
      draft.announcements = [next, ...draft.announcements];
      saved = next;
    } else {
      draft.announcements[index] = { ...draft.announcements[index]!, ...next };
      saved = draft.announcements[index]!;
    }
  });
  return saved;
}

export function deleteAnnouncement(id: string): boolean {
  let removed = false;
  mutateDemoStore((draft) => {
    const before = draft.announcements.length;
    draft.announcements = draft.announcements.filter((a) => a.id !== id);
    removed = draft.announcements.length < before;
  });
  return removed;
}

export function upsertGalleryImage(image: GalleryImage): GalleryImage {
  const now = nowIso();
  let saved = image;
  mutateDemoStore((draft) => {
    const index = draft.gallery.findIndex((g) => g.id === image.id);
    const next = { ...image, updated_at: now };
    if (index === -1) {
      draft.gallery = [...draft.gallery, next];
      saved = next;
    } else {
      draft.gallery[index] = { ...draft.gallery[index]!, ...next };
      saved = draft.gallery[index]!;
    }
  });
  return saved;
}

export function deleteGalleryImage(id: string): boolean {
  let removed = false;
  mutateDemoStore((draft) => {
    const before = draft.gallery.length;
    draft.gallery = draft.gallery.filter((g) => g.id !== id);
    removed = draft.gallery.length < before;
  });
  return removed;
}

export function updateSettings(
  patch: Partial<SiteSettings>,
): SiteSettings {
  mutateDemoStore((draft) => {
    draft.settings = {
      ...draft.settings,
      ...patch,
      updated_at: nowIso(),
    };
  });
  return store.settings;
}

export function updatePage(
  slug: string,
  patch: Partial<EditablePage>,
): EditablePage {
  let updated: EditablePage | null = null;
  mutateDemoStore((draft) => {
    const index = draft.pages.findIndex((p) => p.slug === slug);
    if (index === -1) return;
    draft.pages[index] = {
      ...draft.pages[index]!,
      ...patch,
      updated_at: nowIso(),
    };
    updated = draft.pages[index]!;
  });
  if (!updated) throw new Error(`Page not found: ${slug}`);
  return updated;
}

export function addImport(record: ImportRecord): ImportRecord {
  mutateDemoStore((draft) => {
    draft.imports = [record, ...draft.imports];
  });
  return record;
}
