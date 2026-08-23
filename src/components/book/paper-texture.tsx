import { cn } from "@/lib/utils";

type PaperTextureProps = {
  className?: string;
};

/** Lightweight CSS noise overlay for paper surfaces. */
export function PaperTexture({ className }: PaperTextureProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "paper-grain pointer-events-none absolute inset-0 opacity-[0.04]",
        className,
      )}
    />
  );
}
