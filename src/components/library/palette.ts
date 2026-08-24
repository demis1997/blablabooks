import type { BookAccent } from "./types";
import { cn } from "@/lib/utils";

export const ACCENT_FILL: Record<BookAccent, string> = {
  blush: "bg-blush",
  powder: "bg-powder",
  lavender: "bg-lavender",
  sage: "bg-sage",
  butter: "bg-butter",
};

export const ACCENT_SOFT: Record<BookAccent, string> = {
  blush: "bg-blush/55",
  powder: "bg-powder/60",
  lavender: "bg-lavender/55",
  sage: "bg-sage/60",
  butter: "bg-butter/60",
};

export const ACCENT_INK: Record<BookAccent, string> = {
  blush: "text-blush",
  powder: "text-powder",
  lavender: "text-lavender",
  sage: "text-sage",
  butter: "text-butter",
};

export function clothClass(accent: BookAccent, className?: string) {
  return cn("book-cloth", ACCENT_FILL[accent], className);
}
