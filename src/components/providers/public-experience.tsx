"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { BookCoverIntro } from "@/components/book/book-cover-intro";
import { cn } from "@/lib/utils";

type PublicExperienceProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Public chrome wrapper: book intro + desk background.
 * Admin routes render children only (header still comes from layout).
 */
export function PublicExperience({
  children,
  className,
}: PublicExperienceProps) {
  const pathname = usePathname();
  const isAdmin = pathname.includes("/admin");
  const t = useTranslations("BookExperience");
  const [introDone, setIntroDone] = useState(false);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative flex min-h-0 flex-1 flex-col", className)}>
      {!introDone ? (
        <BookCoverIntro
          openLabel={t("openBook")}
          skipLabel={t("skipIntro")}
          onComplete={() => setIntroDone(true)}
        />
      ) : null}
      <div
        className={cn(
          "book-desk-bg flex min-h-full flex-1 flex-col",
          !introDone && "pointer-events-none select-none",
        )}
        aria-hidden={!introDone}
      >
        {children}
      </div>
    </div>
  );
}
