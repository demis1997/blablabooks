import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length ? v : undefined));

export const suggestBookSearchResultSchema = z.object({
  title: z.string().trim().min(1).max(500),
  subtitle: optionalText,
  authors: z.array(z.string()).default([]),
  firstPublishYear: z.number().optional(),
  pageCount: z.number().optional(),
  language: optionalText,
  isbn10: optionalText,
  isbn13: optionalText,
  subjects: z.array(z.string()).optional(),
  coverUrl: z.string().optional(),
  openLibraryWorkKey: optionalText,
  openLibraryEditionKey: optionalText,
  googleBooksId: optionalText,
  description: optionalText,
  provider: z.enum(["open_library", "google_books"]),
});

export type SuggestBookSearchResultInput = z.infer<
  typeof suggestBookSearchResultSchema
>;
