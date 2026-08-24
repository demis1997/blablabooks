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
    title: "The Year of Magical Thinking",
    subtitle: null,
    authors: ["Joan Didion"],
    page_count: 227,
    description:
      "Joan Didion’s National Book Award–winning memoir of the year after her husband’s sudden death — a clear-eyed account of grief, memory, and the mind’s refusal to accept loss.",
    description_ru:
      "Отмеченные Национальной книжной премией мемуары Джоан Дидион о годе после внезапной смерти мужа — ясный рассказ о горе, памяти и о том, как разум отказывается принимать утрату.",
    isbn_10: "140004314X",
    isbn_13: "9781400043149",
    first_publish_year: 2005,
    edition_publish_year: 2005,
    language: "eng",
    subjects: ["Memoir", "Grief", "Nonfiction", "Biography"],
    open_library_work_key: "/works/OL500171W",
    open_library_edition_key: "/books/OL23240168M",
    google_books_id: "MOJZ8ihldbAC",
    cover_url: "https://covers.openlibrary.org/b/id/13693-L.jpg",
    custom_cover_path: null,
    status: "currently_reading",
    selected_month: 8,
    selected_year: 2026,
    club_note: "This month’s club book.",
    club_note_ru: "Книга клуба в этом месяце.",
    is_archived: false,
    date_added: "2026-07-01",
    created_at: "2026-07-01T10:00:00.000Z",
    updated_at: "2026-08-01T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111201",
    title: "Manyunya",
    subtitle: "Манюня",
    authors: ["Narine Abgaryan"],
    page_count: null,
    description: null,
    description_ru: "«Манюня» – светлый, пропитанный солнцем и запахами южного базара и потрясающе смешной рассказ о детстве, о двух девочках-подружках Наре и Манюне, о грозной и доброй Ба – бабушке Манюни, и о куче их родственников, постоянно попадающих в казусные ситуации. Это то самое теплое, озорное и полное веселых приключений детство, которое делает человека счастливым на всю жизнь. Книга – лауреат премии «Рукопись года».",
    isbn_10: null,
    isbn_13: "9785170690909",
    first_publish_year: null,
    edition_publish_year: null,
    language: "rus",
    subjects: ["Novel"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9785170690909-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Наташа",
    club_note_ru: "Рекомендовала Наташа",
    is_archived: false,
    date_added: "2026-01-01",
    created_at: "2026-01-01T10:00:00.000Z",
    updated_at: "2026-01-01T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111202",
    title: "We Were Never Here",
    subtitle: null,
    authors: ["Andrea Bartz"],
    page_count: null,
    description: `Emily is having the time of her life--she's in the mountains of Chile with her best friend, Kristen, on their annual reunion trip, and the women are feeling closer than ever. But on the last night of their trip, Emily enters their hotel suite to find blood and broken glass on the floor. Kristen says the cute backpacker she'd been flirting with attacked her, and she had no choice but to kill him in self-defense. Even more shocking: The scene is horrifyingly similar to last year's trip, when another backpacker wound up dead. Emily can't believe it's happened again--can lightning really strike twice?`,
    description_ru: null,
    isbn_10: null,
    isbn_13: "9781982117849",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Novel"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9781982117849-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Ksenia Mershina",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-02",
    created_at: "2026-01-02T10:00:00.000Z",
    updated_at: "2026-01-02T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111203",
    title: "The Noise of Time",
    subtitle: null,
    authors: ["Julian Barnes"],
    page_count: null,
    description: "Fictional biography of Shostakovich.",
    description_ru: null,
    isbn_10: null,
    isbn_13: "9781101947241",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Fiction", "Biography"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9781101947241-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Ksenia Mershina",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-03",
    created_at: "2026-01-03T10:00:00.000Z",
    updated_at: "2026-01-03T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111204",
    title: "Russian Canary",
    subtitle: "Русская Канарейка",
    authors: ["Dina Rubina"],
    page_count: null,
    description: null,
    description_ru: null,
    isbn_10: null,
    isbn_13: null,
    first_publish_year: null,
    edition_publish_year: null,
    language: "rus",
    subjects: ["Novel"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: null,
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: `For ENG Club: Dina's novel of your choice. For RUS Club: Русская Канарейка. Recommended by Ksenia Mershina.`,
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-04",
    created_at: "2026-01-04T10:00:00.000Z",
    updated_at: "2026-01-04T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111205",
    title: "Lying on the Couch",
    subtitle: null,
    authors: ["Irvin D. Yalom"],
    page_count: null,
    description: `From the bestselling author of Love's Executioner and When Nietzsche Wept comes a provocative exploration of the unusual relationships three therapists form with their patients.

Seymour is a therapist of the old school who blurs the boundary of sexual propriety with one of his clients. Marshal, who is haunted by his own obsessive-compulsive behaviors, is troubled by the role money plays in his dealings with his patients. Finally, there is Ernest Lash. Driven by his sincere desire to help and his faith in psychoanalysis, he invents a radically new approach to therapy -- a totally open and honest relationship with a patient that threatens to have devastating results.

Exposing the many lies that are told on and off the psychoanalyst's couch, Lying on the Couch gives readers a tantalizing, almost illicit, glimpse at what their therapists might really be thinking during their sessions. Fascinating, engrossing and relentlessly intelligent, it ultimately moves readers with a denouement of surprising humanity and redemptive faith.`,
    description_ru: null,
    isbn_10: null,
    isbn_13: "9780060928513",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Novel", "Psychological fiction"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9780060928513-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Ksenia Mershina",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-05",
    created_at: "2026-01-05T10:00:00.000Z",
    updated_at: "2026-01-05T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111206",
    title: "The One",
    subtitle: null,
    authors: ["John Marrs"],
    page_count: null,
    description: "How far would you go to find The One?",
    description_ru: null,
    isbn_10: null,
    isbn_13: "9781335008435",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Fiction", "Thriller"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9781335008435-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Elena Khazieva",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-06",
    created_at: "2026-01-06T10:00:00.000Z",
    updated_at: "2026-01-06T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111207",
    title: "Straight from the Horse's Mouth",
    subtitle: null,
    authors: ["Meryem Alaoui"],
    page_count: null,
    description: "Thirty-four-year-old prostitute Jmiaa reflects on the bustling world around her with a brutal honesty, but also a quick wit that cuts through the drudgery. Like many of the women in her working-class Casablanca neighborhood, Jmiaa struggles to earn enough money to support herself and her family—often including the deadbeat husband who walked out on her and their young daughter. While she doesn’t despair about her profession like her roommate, Halima, who reads the Quran between clients, she still has to maintain a delicate balance between her reality and the “respectable” one she paints for her own more conservative mother.",
    description_ru: null,
    isbn_10: null,
    isbn_13: "9781635420340",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Fiction"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9781635420340-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Raminta?",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-07",
    created_at: "2026-01-07T10:00:00.000Z",
    updated_at: "2026-01-07T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111208",
    title: "Breasts and Eggs",
    subtitle: null,
    authors: ["Mieko Kawakami"],
    page_count: null,
    description: `Breasts and Eggs paints a portrait of contemporary womanhood in Japan and recounts the intimate journeys of three women as they confront oppressive mores and their own uncertainties on the road to finding peace and futures they can truly call their own.

It tells the story of three women: the thirty-year-old Natsu, her older sister, Makiko, and Makiko’s daughter, Midoriko. Makiko has traveled to Tokyo in search of an affordable breast enhancement procedure. She is accompanied by Midoriko, who has recently grown silent, finding herself unable to voice the vague yet overwhelming pressures associated with growing up. Her silence proves a catalyst for each woman to confront her fears and frustrations.`,
    description_ru: null,
    isbn_10: null,
    isbn_13: "9781609455873",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Fiction"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9781609455873-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Raminta?",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-08",
    created_at: "2026-01-08T10:00:00.000Z",
    updated_at: "2026-01-08T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111209",
    title: "Fates and Furies",
    subtitle: null,
    authors: ["Lauren Groff"],
    page_count: null,
    description: `Every story has two sides. Every relationship has two perspectives. And sometimes, it turns out, the key to a great marriage is not its truths but its secrets. At the core of this rich, expansive, layered novel, Lauren Groff presents the story of one such marriage over the course of twenty-four years.

At age twenty-two, Lotto and Mathilde are tall, glamorous, madly in love, and destined for greatness. A decade later, their marriage is still the envy of their friends, but with an electric thrill we understand that things are even more complicated and remarkable than they have seemed.`,
    description_ru: null,
    isbn_10: null,
    isbn_13: "9781594634482",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Fiction"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9781594634482-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Raminta?",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-09",
    created_at: "2026-01-09T10:00:00.000Z",
    updated_at: "2026-01-09T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111210",
    title: "The Housemaid",
    subtitle: null,
    authors: ["Freida McFadden"],
    page_count: null,
    description: "The story delves into the life of Millie Calloway, a young woman with a troubled past, who finds herself employed as a housekeeper for Nina Winchester, a wealthy woman grappling with apparent mental health issues.",
    description_ru: null,
    isbn_10: null,
    isbn_13: "9781538742570",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Thriller", "Suspense", "Mystery", "Psychological Fiction", "Domestic Fiction"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9781538742570-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Joelle",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-10",
    created_at: "2026-01-10T10:00:00.000Z",
    updated_at: "2026-01-10T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111211",
    title: "They Do It With Mirrors",
    subtitle: null,
    authors: ["Agatha Christie"],
    page_count: null,
    description: `A man is shot at in a juvenile reform home – but someone else dies…
Miss Marple senses danger when she visits a friend living in a Victorian mansion which doubles as a rehabilitation centre for delinquents. Her fears are confirmed when a youth fires a revolver at the administrator, Lewis Serrocold. Neither is injured. But a mysterious visitor, Mr Gulbrandsen, is less fortunate – shot dead simultaneously in another part of the building.`,
    description_ru: null,
    isbn_10: null,
    isbn_13: "9780062073662",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Detective"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9780062073662-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Daniella",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-11",
    created_at: "2026-01-11T10:00:00.000Z",
    updated_at: "2026-01-11T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111212",
    title: "Poor Things",
    subtitle: null,
    authors: ["Alasdair Gray"],
    page_count: null,
    description: `Postmodern revision of Frankenstein that replaces the traditional monster with Bella Baxter - a beautiful young erotomaniac brought back to life with the brain of an infant. Godwin Baxter's scientific ambition to create the perfect companion is realized when he finds the drowned body of Bella, but his dream is thwarted by Dr. Archibald McCandless's jealous love for Baxter's creation.

An Oscar-winning movie is based on it.`,
    description_ru: null,
    isbn_10: null,
    isbn_13: "9781564783073",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Fiction"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9781564783073-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Ksenia Mershina",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-12",
    created_at: "2026-01-12T10:00:00.000Z",
    updated_at: "2026-01-12T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111213",
    title: "Тоннель",
    subtitle: "The Tunnel",
    authors: ["Yana Wagner"],
    page_count: null,
    description: null,
    description_ru: `Рекомендовали как отличную книгу для клуба. Подтверждаю, понравилась.

Несколько сотен человек внезапно оказываются запертыми под Москвой-рекой. Причина неизвестна, спасение не приходит, и спустя считаные часы всем начинает казаться, что мира за пределами тоннеля не осталось. Важно только то, что внутри.`,
    isbn_10: null,
    isbn_13: null,
    first_publish_year: null,
    edition_publish_year: null,
    language: "rus",
    subjects: ["Fiction", "Thriller"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: null,
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Daria Solyanik",
    club_note_ru: "Рекомендовала Daria Solyanik",
    is_archived: false,
    date_added: "2026-01-13",
    created_at: "2026-01-13T10:00:00.000Z",
    updated_at: "2026-01-13T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111214",
    title: "The Hottest Dishes of the Tartar Cuisine",
    subtitle: null,
    authors: ["Alina Bronsky"],
    page_count: null,
    description: `In this acidly funny novel of life in Soviet Russia, a cruel comic romp ends as a surprisingly winning story of hardship and resilience (The New Yorker).
When Rosa Achmetowna discovers that her seventeen-year-old daughter, Sulfia, is pregnant, she tries every bizarre home remedy there is to thwart the pregnancy. But despite her best efforts, the baby girl Aminat is born―and immediately wins Rosa’s heart. The dark-eyed Aminat is a Tartar through and through, just like Rosa, and the devious grandmother wastes no time in plotting to steal her away from the woefully inept Sulfia.
When Aminat, now a wild and willful teenager, catches the eye of a sleazy German cookbook writer researching Tartar cuisine, Rosa is quick to broker a deal that will guarantee all three women a passage out of the Soviet Union. But as soon as they are settled in the West, the dysfunctional ties that bind mother, daughter, and grandmother begin to fray.`,
    description_ru: null,
    isbn_10: null,
    isbn_13: "9781609451165",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Fiction", "Novel"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9781609451165-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Raminta",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-14",
    created_at: "2026-01-14T10:00:00.000Z",
    updated_at: "2026-01-14T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111215",
    title: "Demon Copperhead",
    subtitle: null,
    authors: ["Barbara Kingsolver"],
    page_count: null,
    description: `#1 on the NYT readers' list for best books of 25 years. Very good.

Set in the mountains of southern Appalachia, this is the story of a boy born to a teenaged single mother in a single-wide trailer, with no assets beyond his dead father's good looks and copper-colored hair, a caustic wit, and a fierce talent for survival. In a plot that never pauses for breath, relayed in his own unsparing voice, he braves the modern perils of foster care, child labor, derelict schools, athletic success, addiction, disastrous loves, and crushing losses. Through all of it, he reckons with his own invisibility in a popular culture where even the superheroes have abandoned rural people in favor of cities.`,
    description_ru: null,
    isbn_10: null,
    isbn_13: "9780063251922",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Fiction", "Novel"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9780063251922-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Daria Solyanik. Russian translation by Завозова in progress.",
    club_note_ru: "Рекомендовала Daria Solyanik. Перевод Завозовой в работе.",
    is_archived: false,
    date_added: "2026-01-15",
    created_at: "2026-01-15T10:00:00.000Z",
    updated_at: "2026-01-15T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111216",
    title: "Niki",
    subtitle: null,
    authors: ["Christos Chomenidis"],
    page_count: null,
    description: `A resilient Greek woman recounts her and her family’s extraordinary story at the end of her life, marked by the great historical events of the twentieth century.

Born in 1938, Niki, the daughter of the deputy secretary general of the Greek Communist Party, is swept up in turmoil before her first: her parents are arrested, and she joins her mother in exile on an island near Santorini. Growing up, she experiences the Italian and German invasion, the Nazi occupation, and the civil war that came after, often caught between her socialist values and those of the right-wing establishment, to which half her relatives belong.
Through her memories and the stories of her family, with roots on both coasts of the Aegean Sea, Niki also tells the history of Greece and Asia Minor from the late nineteenth century to the middle of the twentieth. Her remarkable tales, full of humor and verve in spite of hardship, are populated by working-class heroes, privileged elites, daring revolutionaries, and free-spirited bohemians.`,
    description_ru: null,
    isbn_10: null,
    isbn_13: null,
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Historical fiction"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: null,
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Athos Demetriou. No Russian translation.",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-16",
    created_at: "2026-01-16T10:00:00.000Z",
    updated_at: "2026-01-16T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111217",
    title: "The Herd",
    subtitle: "Толпа",
    authors: ["Emily Edwards"],
    page_count: null,
    description: `You should never judge how someone chooses to raise their child.

Elizabeth and Bryony are polar opposites but their unexpected friendship has always worked. They're the best of friends, and godmothers to each other's daughters - because they trust that the safety of their children is both of their top priority.
But what if their choice could harm your own child?
Little do they know that they differ radically over one very important issue. And when Bryony, afraid of being judged, tells what is supposed to be a harmless white lie before a child's birthday party, the consequences are more catastrophic than either of them could ever have imagined . . .`,
    description_ru: null,
    isbn_10: null,
    isbn_13: "9781529360042",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Social Drama"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9781529360042-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Svetlana Doronina",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-17",
    created_at: "2026-01-17T10:00:00.000Z",
    updated_at: "2026-01-17T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111218",
    title: "Good Material",
    subtitle: null,
    authors: ["Dolly Alderton"],
    page_count: null,
    description: `Andy's story wasn't meant to turn out this way. Living out of a suitcase in his best friends' spare room, waiting for his career as a stand-up comedian to finally take off, he struggles to process the life-ruining end of his relationship with the only woman he's ever truly loved.
As he tries to solve the seemingly unsolvable mystery of his broken relationship, he contends with career catastrophe, social media paranoia, a rapidly dwindling friendship group and the growing suspicion that, at 35, he really should have figured this all out by now.
Andy has a lot to learn, not least his ex-girlfriend's side of the story.
Warm, wise, funny and achingly relatable, Dolly Alderton's highly-anticipated second novel is about the mystery of what draws us together - and what pulls us apart - the pain of really growing up, and the stories we tell about our lives.`,
    description_ru: null,
    isbn_10: null,
    isbn_13: "9780593801307",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Fiction", "Romance"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9780593801307-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Svetlana Doronina",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-18",
    created_at: "2026-01-18T10:00:00.000Z",
    updated_at: "2026-01-18T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111219",
    title: "Perfection",
    subtitle: null,
    authors: ["Vincenzo Latronico"],
    page_count: null,
    description: `Millennial expat couple Anna and Tom are living the dream in Berlin, in a bright, plant-filled apartment in Neukölln. They are young digital creatives, freelancers without too many constraints. They have a passion for food, progressive politics, sexual experimentation and Berlin's twenty-four-hour party scene. Their ideal existence is also that of an entire generation, lived out on Instagram, but outside the images they create for themselves, dissatisfaction and ennui burgeon. Their work as graphic designers becomes repetitive. Friends move back home, have children, grow up. An attempt at political activism during the refugee crisis proves fruitless. And in that picture-perfect life Anna and Tom feel increasingly trapped, yearning for an authenticity and a sense of purpose that seem perennially just out of their grasp. With the stylistic mastery of Georges Perec and nihilism of Michel Houellebecq, Perfection, translated by Sophie Hughes, is a sociological novel about the emptiness of contemporary existence, beautifully written, brilliantly scathing.`,
    description_ru: null,
    isbn_10: null,
    isbn_13: "9781681378725",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Fiction"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9781681378725-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Christos",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-19",
    created_at: "2026-01-19T10:00:00.000Z",
    updated_at: "2026-01-19T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111220",
    title: "In Memory of Memory",
    subtitle: "Памяти памяти",
    authors: ["Maria Stepanova"],
    page_count: null,
    description: "With the death of her aunt, the narrator is left to sift through an apartment full of faded photographs, old postcards, letters, diaries, and heaps of souvenirs: a withered repository of an entire century of life in Russia. Carefully reassembled with calm, steady hands, these shards tell the story of an ordinary family that somehow managed to survive the myriad persecutions and repressions of the last century. The family’s pursuit of a quiet, civilized, ordinary life—during such atrocious times—is itself a strange odyssey.",
    description_ru: null,
    isbn_10: null,
    isbn_13: "9780811228831",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Historical fiction"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9780811228831-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Christos",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-20",
    created_at: "2026-01-20T10:00:00.000Z",
    updated_at: "2026-01-20T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111221",
    title: "Две жизни",
    subtitle: "Two Lives",
    authors: ["Kora Antarova"],
    page_count: null,
    description: "Written by a Russian opera singer and spiritual seeker in the 1930s. Rare blend of mysticism and philosophy. There are unofficial translations to English.",
    description_ru: null,
    isbn_10: null,
    isbn_13: null,
    first_publish_year: null,
    edition_publish_year: null,
    language: "rus",
    subjects: ["Spiritual Fiction"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: null,
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Ksenia Mershina (originally via Kristina, who might join).",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-21",
    created_at: "2026-01-21T10:00:00.000Z",
    updated_at: "2026-01-21T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111222",
    title: "Assembly",
    subtitle: null,
    authors: ["Natasha Brown"],
    page_count: null,
    description: `It is a book by a Black British woman, and there's a lot about Britain's colonial legacy; however it is not the point. I've read some articles and a couple reviews about her. Vogue article. It does sound interesting.

Brown’s unnamed protagonist is a successful, Oxbridge-educated Black British woman working in the “ruthless, efficient money-machine” of a blue-chip bank, so removed from life that her soul seems almost fully detachable. Her cool gaze takes in everything – the micro-aggressions of overbearing colleagues, the Occupy hippies protesting outside her office and her hapless upper-middle-class boyfriend (“did I prefer this to sleeping alone?” she deadpans).

It is about Britain, about racism and class, it is small and as they say, written in razor-sharp language.`,
    description_ru: null,
    isbn_10: null,
    isbn_13: "9780316268264",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Novella"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9780316268264-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Ksenia Mershina",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-22",
    created_at: "2026-01-22T10:00:00.000Z",
    updated_at: "2026-01-22T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111223",
    title: "The Lost Daughter",
    subtitle: "Незнакомая дочь",
    authors: ["Elena Ferrante"],
    page_count: 140,
    description: `Ferrante is possibly the biggest name in modern Italian literature.

Leda, a middle-aged divorcée, is alone for the first time in years after her two adult daughters leave home to live with their father in Toronto. Enjoying an unexpected sense of liberty, she heads to the Ionian coast for a vacation.
But she soon finds herself intrigued by Nina, a young mother on the beach, eventually striking up a conversation with her. After Nina confides a dark secret, one seemingly trivial occurrence leads to events that could destroy Nina’s family.`,
    description_ru: null,
    isbn_10: null,
    isbn_13: "9781933372426",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Fiction"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9781933372426-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Christos / Daria Solyanik",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-23",
    created_at: "2026-01-23T10:00:00.000Z",
    updated_at: "2026-01-23T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111224",
    title: "An Orchestra of Minorities",
    subtitle: "Оркестр меньшинств",
    authors: ["Chigozie Obioma"],
    page_count: 448,
    description: `About Cyprus, as well as many other things.

An Orchestra of Minorities is narrated by the chi, or spirit of a young poultry farmer named Chinonso. His life is set off course when he sees a woman who is about to jump off a bridge. Horrified by her recklessness, he hurls two of his prized chickens off the bridge. The woman, Ndali, is stopped in her tracks.

Chinonso and Ndali fall in love but she is from an educated and wealthy family. When her family objects to the union on the grounds that he is not her social equal, he sells most of his possessions to attend college in Cyprus. But when he arrives in Cyprus, he discovers that he has been utterly duped by the young Nigerian who has made the arrangements for him. Penniless, homeless, we watch as he gets further and further away from his dream and from home.

A contemporary twist on the Odyssey.`,
    description_ru: null,
    isbn_10: null,
    isbn_13: "9780316412391",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Fiction"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9780316412391-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Christos",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-24",
    created_at: "2026-01-24T10:00:00.000Z",
    updated_at: "2026-01-24T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111225",
    title: "The Fabulist",
    subtitle: "Сказители",
    authors: ["Uthis Haemamool"],
    page_count: 378,
    description: `A polyphonic reimagining of Thai history, sweeping from the earth’s creation to the fragmented future of one family.

An immortal spirit cycles through multiple lives as a tree, a naga, a deer, a rock, and a human. A doctor suffers a stroke and embarks upon a quest for justice in the afterlife. A wife and mother lives out the soap opera of her dreams. A ghostwriter deals with the violent tragedy that befalls his family by turning it into fiction. A woman from the future struggles to break free from a life shaped by her lineage.

The Fabulist is an epic novel by Uthis Haemamool. Spooling out of the district of Kaeng Khoi in Saraburi, Thailand, this book follows four generations of narrative threads as they bluff, conceal, confess, and rewrite themselves into the history of a nation that has long relegated them to the margins of its story.`,
    description_ru: null,
    isbn_10: null,
    isbn_13: null,
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Fiction"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: null,
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Daria Solyanik",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-25",
    created_at: "2026-01-25T10:00:00.000Z",
    updated_at: "2026-01-25T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111226",
    title: "The Hitchhiker's Guide to the Galaxy",
    subtitle: "Автостопом по Галактике",
    authors: ["Douglas Adams"],
    page_count: 216,
    description: `Seconds before the Earth is demolished to make way for a galactic freeway, Arthur Dent is plucked off the planet by his friend Ford Prefect, a researcher for the revised edition of The Hitchhiker's Guide to the Galaxy who, for the last fifteen years, has been posing as an out-of-work actor.

Together this dynamic pair begin a journey through space aided by quotes from The Hitchhiker's Guide ("A towel is about the most massively useful thing an interstellar hitchhiker can have") and a galaxy-full of fellow travelers: Zaphod Beeblebrox--the two-headed, three-armed ex-hippie and totally out-to-lunch president of the galaxy; Trillian, Zaphod's girlfriend (formally Tricia McMillan), whom Arthur tried to pick up at a cocktail party once upon a time zone; Marvin, a paranoid, brilliant, and chronically depressed robot; Veet Voojagig, a former graduate student who is obsessed with the disappearance of all the ballpoint pens he bought over the years.

Where are these pens? Why are we born? Why do we die? Why do we spend so much time between wearing digital watches? For all the answers stick your thumb to the stars. And don't forget to bring a towel!`,
    description_ru: null,
    isbn_10: null,
    isbn_13: "9780345391803",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Science Fiction"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9780345391803-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Katerina Lysenko",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-26",
    created_at: "2026-01-26T10:00:00.000Z",
    updated_at: "2026-01-26T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111227",
    title: "Middlesex",
    subtitle: "Средний пол",
    authors: ["Jeffrey Eugenides"],
    page_count: null,
    description: `The astonishing tale of a gene that passes down through three generations of a Greek-American family and flowers in the body of a teenage girl.

In the spring of 1974, Calliope Stephanides, a student at a girls' school in Grosse Pointe, finds herself drawn to a chain-smoking, strawberry blond classmate with a gift for acting. The passion that furtively develops between them--along with Callie's failure to develop--leads Callie to suspect that she is not like other girls. In fact, she is not really a girl at all.

The explanation for this shocking state of affairs takes us out of suburbia- back before the Detroit race riots of 1967, before the rise of the Motor City and Prohibition, to 1922, when the Turks sacked Smyrna and Callie's grandparents fled for their lives. Back to a tiny village in Asia Minor where two lovers, and one rare genetic mutation, set in motion the metamorphosis that will turn Callie into a being both mythical and perfectly a hermaphrodite.`,
    description_ru: null,
    isbn_10: null,
    isbn_13: "9780312427733",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Historical Fiction"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9780312427733-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Svetlana Doronina",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-27",
    created_at: "2026-01-27T10:00:00.000Z",
    updated_at: "2026-01-27T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111228",
    title: "The Memory Police",
    subtitle: "Полиция памяти",
    authors: ["Yoko Ogawa"],
    page_count: 274,
    description: `On an unnamed island off an unnamed coast, objects are disappearing: first hats, then ribbons, birds, roses—until things become much more serious. Most of the island's inhabitants are oblivious to these changes, while those few imbued with the power to recall the lost objects live in fear of the draconian Memory Police, who are committed to ensuring that what has disappeared remains forgotten.

When a young woman who is struggling to maintain her career as a novelist discovers that her editor is in danger from the Memory Police, she concocts a plan to hide him beneath her floorboards. As fear and loss close in around them, they cling to her writing as the last way of preserving the past.

A surreal, provocative fable about the power of memory and the trauma of loss, The Memory Police is a stunning new work from one of the most exciting contemporary authors writing in any language.`,
    description_ru: null,
    isbn_10: null,
    isbn_13: "9781101911815",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Dystopia", "Science fiction"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9781101911815-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Anna Kassabian",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-28",
    created_at: "2026-01-28T10:00:00.000Z",
    updated_at: "2026-01-28T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111229",
    title: "The Republic of Wine",
    subtitle: "Страна вина",
    authors: ["Mo Yan"],
    page_count: 356,
    description: `When special investigator Ding Gou'er hears persistent rumors that there is cannibalism in the province called the Republic of Wine, he goes to learn the truth. Beginning at the Mount Luo Coal Mine, he meets Diamond Jin, legendary for his capacity to hold his liquor and fondness for young human flesh. A banquet is served during which the special investigator, by meal's end in an alcohol-induced stupor, loses all sense of reality. Interspersed are stories sent to Mo Yan himself by Li Yidou (aka Doctor of Liquor Studies), each one more mad than the next. Wild and politically explosive, The Republic of Wine proves that no regime can stifle creative imagination.`,
    description_ru: null,
    isbn_10: null,
    isbn_13: "9781559705318",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Satirical novel"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9781559705318-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Anna Kassabian",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-29",
    created_at: "2026-01-29T10:00:00.000Z",
    updated_at: "2026-01-29T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111230",
    title: "How Do You Live?",
    subtitle: "Как поживаете?",
    authors: ["Genzaburō Yoshino"],
    page_count: null,
    description: `First published in 1937, Genzaburō Yoshino’s How Do You Live? has long been acknowledged in Japan as a crossover classic for young readers. Academy Award–winning animator Hayao Miyazaki (Spirited Away, My Neighbor Totoro, Howl’s Moving Castle) has called it his favorite childhood book and announced plans to emerge from retirement to make it the basis of a final film.

How Do You Live? is narrated in two voices. The first belongs to Copper, fifteen, who after the death of his father must confront inevitable and enormous change, including his own betrayal of his best friend. In between episodes of Copper’s emerging story, his uncle writes to him in a journal, sharing knowledge and offering advice on life’s big questions as Copper begins to encounter them. Over the course of the story, Copper, like his namesake Copernicus, looks to the stars, and uses his discoveries about the heavens, earth, and human nature to answer the question of how he will live.`,
    description_ru: null,
    isbn_10: null,
    isbn_13: "9781616209773",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Novel", "Japanese classic"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9781616209773-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Anna Kassabian",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-30",
    created_at: "2026-01-30T10:00:00.000Z",
    updated_at: "2026-01-30T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111231",
    title: "Naomi",
    subtitle: null,
    authors: ["Jun'ichirō Tanizaki"],
    page_count: null,
    description: `A hilarious story of one man’s obsession and a brilliant reckoning of a nation’s cultural confusion—from a master Japanese novelist.

When twenty-eight-year-old Joji first lays eyes upon the teenage waitress Naomi, he is instantly smitten by her exotic, almost Western appearance. Determined to transform her into the perfect wife and to whisk her away from the seamy underbelly of post-World War I Tokyo, Joji adopts and ultimately marries Naomi, paying for English and music lessons that promise to mold her into his ideal companion. But as she grows older, Joji discovers that Naomi is far from the naïve girl of his fantasies. And, in Tanizaki’s masterpiece of lurid obsession, passion quickly descends into comically helpless masochism.`,
    description_ru: null,
    isbn_10: null,
    isbn_13: "9780375724749",
    first_publish_year: null,
    edition_publish_year: null,
    language: "eng",
    subjects: ["Fiction"],
    open_library_work_key: null,
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/isbn/9780375724749-L.jpg",
    custom_cover_path: null,
    status: "candidate",
    selected_month: null,
    selected_year: null,
    club_note: "Recommended by Raminta. No Russian translation.",
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-31",
    created_at: "2026-01-31T10:00:00.000Z",
    updated_at: "2026-01-31T10:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111301",
    title: "Outline",
    subtitle: null,
    authors: ["Rachel Cusk"],
    page_count: 256,
    description:
      "A woman teaching in Athens listens to the stories of strangers — a spare, precise novel about how we narrate our lives.",
    description_ru:
      "Женщина, преподающая в Афинах, слушает истории незнакомцев — точный роман о том, как мы рассказываем свои жизни.",
    isbn_10: "0374536140",
    isbn_13: "9780374536145",
    first_publish_year: 2014,
    edition_publish_year: 2015,
    language: "eng",
    subjects: ["Literary fiction", "Novels"],
    open_library_work_key: "/works/OL17873642W",
    open_library_edition_key: "/books/OL27208844M",
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/id/9079084-L.jpg",
    custom_cover_path: null,
    status: "previously_read",
    selected_month: 1,
    selected_year: 2026,
    club_note: null,
    club_note_ru: null,
    is_archived: false,
    date_added: "2025-12-15",
    created_at: "2025-12-15T09:00:00.000Z",
    updated_at: "2026-01-31T09:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111302",
    title: "Let There Be Water",
    subtitle: "Israel's Solution for a Water-Starved World",
    authors: ["Seth M. Siegel"],
    page_count: 352,
    description:
      "How Israel turned scarcity into water innovation — and what the world can learn from it.",
    description_ru:
      "Как Израиль превратил нехватку воды в инновации — и чему может научиться мир.",
    isbn_10: "1250074815",
    isbn_13: "9781250074816",
    first_publish_year: 2015,
    edition_publish_year: 2015,
    language: "eng",
    subjects: ["Nonfiction", "Environment", "Water"],
    open_library_work_key: "/works/OL17308346W",
    open_library_edition_key: "/books/OL27195000M",
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/id/7387256-L.jpg",
    custom_cover_path: null,
    status: "previously_read",
    selected_month: 2,
    selected_year: 2026,
    club_note: null,
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-01-15",
    created_at: "2026-01-15T09:00:00.000Z",
    updated_at: "2026-02-28T09:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111303",
    title: "Yellowface",
    subtitle: null,
    authors: ["R. F. Kuang"],
    page_count: 336,
    description:
      "A biting satire of the publishing world, cultural appropriation, and the hunger for literary fame.",
    description_ru:
      "Едкая сатира на мир издательств, культурную апроприацию и жажду литературной славы.",
    isbn_10: "0063257832",
    isbn_13: "9780063257832",
    first_publish_year: 2023,
    edition_publish_year: 2023,
    language: "eng",
    subjects: ["Literary fiction", "Satire"],
    open_library_work_key: "/works/OL29050559W",
    open_library_edition_key: "/books/OL47372000M",
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/id/13195421-L.jpg",
    custom_cover_path: null,
    status: "previously_read",
    selected_month: 3,
    selected_year: 2026,
    club_note: null,
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-02-15",
    created_at: "2026-02-15T09:00:00.000Z",
    updated_at: "2026-03-31T09:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111304",
    title: "A Field Guide to Getting Lost",
    subtitle: null,
    authors: ["Rebecca Solnit"],
    page_count: 224,
    description:
      "Essays on wandering, uncertainty, and the places — real and imagined — where we lose and find ourselves.",
    description_ru:
      "Эссе о блуждании, неопределённости и местах — реальных и воображаемых — где мы теряемся и находим себя.",
    isbn_10: "0143036930",
    isbn_13: "9780143036937",
    first_publish_year: 2005,
    edition_publish_year: 2006,
    language: "eng",
    subjects: ["Essays", "Nonfiction", "Travel"],
    open_library_work_key: "/works/OL15273770W",
    open_library_edition_key: "/books/OL3421380M",
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/id/400552-L.jpg",
    custom_cover_path: null,
    status: "previously_read",
    selected_month: 4,
    selected_year: 2026,
    club_note: null,
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-03-15",
    created_at: "2026-03-15T09:00:00.000Z",
    updated_at: "2026-04-30T09:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111305",
    title: "The Gentleman from San Francisco",
    subtitle: null,
    authors: ["Ivan Bunin"],
    page_count: 224,
    description:
      "Bunin’s classic stories of wealth, mortality, and the fragile polish of civilized life.",
    description_ru:
      "Классические рассказы Бунина о богатстве, смертности и хрупком лоске цивилизованной жизни.",
    isbn_10: "0140183756",
    isbn_13: "9780140183755",
    first_publish_year: 1915,
    edition_publish_year: 1992,
    language: "eng",
    subjects: ["Short stories", "Classics", "Russian literature"],
    open_library_work_key: "/works/OL34582203W",
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/id/14967893-L.jpg",
    custom_cover_path: null,
    status: "previously_read",
    selected_month: 5,
    selected_year: 2026,
    club_note: null,
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-04-15",
    created_at: "2026-04-15T09:00:00.000Z",
    updated_at: "2026-05-31T09:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111306",
    title: "Against Interpretation",
    subtitle: "And Other Essays",
    authors: ["Susan Sontag"],
    page_count: 336,
    description:
      "Sontag’s landmark essays on art, culture, and the politics of how we look and read.",
    description_ru:
      "Знаковые эссе Сонтаг об искусстве, культуре и о том, как мы смотрим и читаем.",
    isbn_10: "0312280866",
    isbn_13: "9780312280864",
    first_publish_year: 1966,
    edition_publish_year: 2001,
    language: "eng",
    subjects: ["Essays", "Criticism", "Culture"],
    open_library_work_key: "/works/OL496473W",
    open_library_edition_key: "/books/OL24767017M",
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/id/178097-L.jpg",
    custom_cover_path: null,
    status: "previously_read",
    selected_month: 6,
    selected_year: 2026,
    club_note: null,
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-05-15",
    created_at: "2026-05-15T09:00:00.000Z",
    updated_at: "2026-06-30T09:00:00.000Z",
    created_by: null,
  }),
  book({
    id: "11111111-1111-4111-8111-111111111307",
    title: "Audition",
    subtitle: null,
    authors: ["Katie Kitamura"],
    page_count: 208,
    description:
      "A tense, elegant novel about performance, family, and the stories we rehearse until they feel true.",
    description_ru:
      "Напряжённый элегантный роман об игре, семье и историях, которые мы репетируем, пока они не станут правдой.",
    isbn_10: "0593852328",
    isbn_13: "9780593852323",
    first_publish_year: 2025,
    edition_publish_year: 2025,
    language: "eng",
    subjects: ["Literary fiction"],
    open_library_work_key: "/works/OL42417173W",
    open_library_edition_key: null,
    google_books_id: null,
    cover_url: "https://covers.openlibrary.org/b/id/15110596-L.jpg",
    custom_cover_path: null,
    status: "previously_read",
    selected_month: 7,
    selected_year: 2026,
    club_note: null,
    club_note_ru: null,
    is_archived: false,
    date_added: "2026-06-15",
    created_at: "2026-06-15T09:00:00.000Z",
    updated_at: "2026-07-31T09:00:00.000Z",
    created_by: null,
  }),
];

export const DEMO_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "22222222-2222-4222-8222-222222222201",
    title_en: "September meetup — Gin Garden",
    title_ru: "Сентябрьская встреча — Gin Garden",
    description_en:
      "Join us at Gin Garden in Limassol to discuss this month’s book. New members welcome — look for the Bla Bla Books table.",
    description_ru:
      "Присоединяйтесь в Gin Garden в Лимассоле, чтобы обсудить книгу месяца. Новички приветствуются — ищите столик Bla Bla Books.",
    announcement_type: "meetup",
    event_date: "2026-09-28",
    start_time: "19:00",
    end_time: "21:00",
    venue: "Gin Garden",
    address: "Limassol, Cyprus",
    maps_url: "https://www.google.com/maps/search/?api=1&query=Gin+Garden+Limassol",
    image_url: null,
    publish_at: "2026-08-01T08:00:00.000Z",
    expires_at: "2026-09-29T00:00:00.000Z",
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
