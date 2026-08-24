import { cn } from "@/lib/utils";

type LibraryLabelProps = {
  children: React.ReactNode;
  rotate?: number;
  className?: string;
};

export function LibraryLabel({
  children,
  rotate = -0.8,
  className,
}: LibraryLabelProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit max-w-full rounded-sm border border-ink/10 bg-butter/35 px-3 py-1.5 font-display text-sm text-ink shadow-sm",
        className,
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}
