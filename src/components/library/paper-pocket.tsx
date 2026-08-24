import { cn } from "@/lib/utils";
import { PaperTexture } from "@/components/book/paper-texture";

type PaperPocketProps = {
  children: React.ReactNode;
  label?: string;
  className?: string;
};

export function PaperPocket({ children, label, className }: PaperPocketProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-dashed border-ink/18 bg-cream/80 p-3 pt-5",
        className,
      )}
    >
      <PaperTexture className="opacity-[0.04]" />
      {label ? (
        <p className="absolute left-3 top-1 font-display text-[10px] uppercase tracking-wider text-ink-muted">
          {label}
        </p>
      ) : null}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
