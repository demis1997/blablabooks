import { cn } from "@/lib/utils";
import { motionTokens } from "@/lib/motion/tokens";

type BookShellProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Open-book chrome for large screens. On mobile (&lt; lg) renders a simple paper stack.
 */
export function BookShell({ children, className }: BookShellProps) {
  return (
    <div className={cn("book-desk-bg w-full py-8 sm:py-12", className)}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div
          className="relative"
          style={{ perspective: motionTokens.perspective }}
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-[var(--shadow-soft)]",
              "lg:shadow-[0_18px_48px_rgb(48_44_53/0.14),0_4px_12px_rgb(48_44_53/0.06)]",
            )}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* page edge stack — desktop open-book chrome */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-3 left-0 hidden w-2 rounded-l-sm bg-gradient-to-r from-ink/12 via-blush/30 to-transparent lg:block"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-3 right-0 hidden w-2 rounded-r-sm bg-gradient-to-l from-ink/12 via-powder/30 to-transparent lg:block"
            />

            {/* center spine strip */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-4 -translate-x-1/2 bg-gradient-to-r from-ink/10 via-ink/5 to-ink/10 lg:block"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-6 left-1/2 z-10 hidden w-px -translate-x-1/2 bg-ink/15 lg:block"
            />

            <div className="relative z-[1]">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
