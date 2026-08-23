import { cn } from "@/lib/utils";
import { PaperTexture } from "@/components/book/paper-texture";
import { PageNumber } from "@/components/book/page-number";

type BookPageProps = {
  children: React.ReactNode;
  className?: string;
  chapterTitle?: string;
  pageNumber?: number | string;
  side?: "left" | "right";
};

export function BookPage({
  children,
  className,
  chapterTitle,
  pageNumber,
  side = "left",
}: BookPageProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[12rem] flex-col bg-cream/90 p-6 sm:p-8",
        className,
      )}
    >
      <PaperTexture />
      <div
        aria-hidden
        className={cn(
          "book-spine-gutter pointer-events-none absolute inset-y-0 w-10",
          side === "left" ? "right-0" : "left-0",
        )}
        data-side={side}
      />

      <div className="relative z-[1] flex flex-1 flex-col">
        {chapterTitle ? (
          <header className="mb-4 border-b border-ink/8 pb-3">
            <p className="font-display text-sm font-semibold tracking-wide text-ink">
              {chapterTitle}
            </p>
          </header>
        ) : null}

        <div className="flex-1">{children}</div>

        {pageNumber != null ? (
          <footer
            className={cn(
              "mt-6 flex",
              side === "right" ? "justify-end" : "justify-start",
            )}
          >
            <PageNumber number={pageNumber} />
          </footer>
        ) : null}
      </div>
    </div>
  );
}
