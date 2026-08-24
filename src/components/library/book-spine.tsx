import { cn } from "@/lib/utils";
import { ACCENT_FILL } from "./palette";
import type { BookAccent } from "./types";

type BookSpineProps = {
  accent: BookAccent;
  stamped?: boolean;
  className?: string;
};

export function BookSpine({
  accent,
  stamped = true,
  className,
}: BookSpineProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative hidden w-3 shrink-0 lg:block",
        ACCENT_FILL[accent],
        className,
      )}
    >
      <div className="absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-ink/20" />
      {stamped ? (
        <div className="absolute inset-x-0 top-8 h-10 bg-gradient-to-b from-ink/15 via-transparent to-ink/10" />
      ) : null}
      <div className="book-spine-gutter absolute inset-0" />
    </div>
  );
}
