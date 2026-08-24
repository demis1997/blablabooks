"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/empty-state";
import { RandomizerExperience } from "@/components/randomizer/randomizer-experience";
import { SuggestCandidate } from "@/components/randomizer/suggest-candidate";
import type { Book } from "@/types/database";

type PublicRandomizerProps = {
  initialBooks: Book[];
  enabled: boolean;
};

export function PublicRandomizer({
  initialBooks,
  enabled,
}: PublicRandomizerProps) {
  const t = useTranslations("Randomizer");
  const [added, setAdded] = useState<Book[]>([]);

  const books = useMemo(() => {
    const byId = new Map(initialBooks.map((book) => [book.id, book]));
    for (const book of added) {
      if (!byId.has(book.id)) byId.set(book.id, book);
    }
    return Array.from(byId.values());
  }, [initialBooks, added]);

  if (!enabled) {
    return (
      <EmptyState title={t("publicDisabled")} description={t("adminOnly")} />
    );
  }

  return (
    <div>
      {books.length === 0 ? (
        <EmptyState
          title={t("eligibleCount", { count: 0 })}
          description={t("emptyPool")}
        />
      ) : (
        <RandomizerExperience eligibleBooks={books} displayOnly />
      )}
      <SuggestCandidate
        onAdded={(book) => {
          setAdded((prev) =>
            prev.some((item) => item.id === book.id) ? prev : [book, ...prev],
          );
        }}
      />
    </div>
  );
}
