export const INSTAGRAM_URL = "https://www.instagram.com/bla.bla.books.cy/";
export const SITE_NAME = "Bla Bla Books";
export const LOCALES = ["en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const GOOGLE_SHEETS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1Y2g0gUyU4flYHAEv2wKilegBTzO_mmPPyPLI_vuXPtA/export?format=csv&gid=1666907779";
