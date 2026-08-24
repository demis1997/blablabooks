import { cn } from "@/lib/utils";

type BookmarkRibbonProps = {
  tone?: "blush" | "powder" | "lavender" | "sage" | "butter";
  className?: string;
};

const TONES = {
  blush: "from-[#e8a4b4] to-[#c9788c]",
  powder: "from-[#9ec8de] to-[#6fa3bf]",
  lavender: "from-[#c4b5e4] to-[#9a88c4]",
  sage: "from-[#b7c9aa] to-[#8aa37a]",
  butter: "from-[#e8d07a] to-[#c9ae4e]",
} as const;

export function BookmarkRibbon({
  tone = "blush",
  className,
}: BookmarkRibbonProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute right-8 top-0 z-20 h-14 w-3.5 bg-gradient-to-b shadow-sm",
        TONES[tone],
        className,
      )}
      style={{
        clipPath: "polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)",
      }}
    />
  );
}
