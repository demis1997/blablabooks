"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { BookSearchCombobox } from "@/components/books/book-search-combobox";
import {
  suggestCandidateBook,
  type SuggestBookCode,
} from "@/lib/actions/suggest-book";
import type { Book, BookSearchResult } from "@/types/database";

type SuggestCandidateProps = {
  onAdded: (book: Book) => void;
};

export function SuggestCandidate({ onAdded }: SuggestCandidateProps) {
  const t = useTranslations("Randomizer");
  const [isPending, startTransition] = useTransition();

  const messageFor = (code: SuggestBookCode) => {
    switch (code) {
      case "added":
        return t("added");
      case "restored":
        return t("restored");
      case "already_in_pool":
        return t("alreadyInPool");
      case "already_current":
        return t("alreadyCurrent");
      case "already_read":
        return t("alreadyRead");
      case "rate_limited":
        return t("rateLimited");
      default:
        return t("unavailable");
    }
  };

  const handleSelect = (result: BookSearchResult) => {
    startTransition(() => {
      void (async () => {
        const outcome = await suggestCandidateBook(result);
        if (outcome.ok && outcome.data) {
          onAdded(outcome.data);
          toast.success(messageFor(outcome.code));
          return;
        }
        toast.error(messageFor(outcome.code));
      })();
    });
  };

  return (
    <div className="mx-auto mt-10 max-w-xl border-t border-ink/10 pt-8 text-left">
      <h2 className="font-display text-xl text-ink">{t("addTitle")}</h2>
      <p className="mt-1 text-sm text-ink-muted">{t("addHint")}</p>
      <BookSearchCombobox
        className="mt-4"
        disabled={isPending}
        onSelect={handleSelect}
        labels={{
          placeholder: t("searchPlaceholder"),
          noResults: t("noResults"),
          loadMore: t("loadMore"),
        }}
      />
    </div>
  );
}
