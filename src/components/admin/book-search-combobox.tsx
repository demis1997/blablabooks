"use client";

import { useTranslations } from "next-intl";
import { BookSearchCombobox as CatalogSearch } from "@/components/books/book-search-combobox";
import type { BookSearchResult } from "@/types/database";

type BookSearchComboboxProps = {
  onSelect: (result: BookSearchResult) => void;
  className?: string;
};

export function BookSearchCombobox({
  onSelect,
  className,
}: BookSearchComboboxProps) {
  const t = useTranslations("Admin.books");

  return (
    <CatalogSearch
      className={className}
      onSelect={onSelect}
      labels={{
        label: t("searchCatalog"),
        placeholder: t("searchPlaceholder"),
        noResults: t("noResults"),
        loadMore: t("loadMore"),
      }}
    />
  );
}
