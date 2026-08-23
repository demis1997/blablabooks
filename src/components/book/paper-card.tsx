import { cn } from "@/lib/utils";
import { PaperTexture } from "@/components/book/paper-texture";

type PaperCardProps = {
  children: React.ReactNode;
  className?: string;
  /** Soft paper tilt in degrees (−1 to 1 recommended). */
  rotate?: number;
};

export function PaperCard({ children, className, rotate = 0 }: PaperCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-ink/8 bg-paper shadow-[var(--shadow-soft)]",
        className,
      )}
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      <PaperTexture />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
