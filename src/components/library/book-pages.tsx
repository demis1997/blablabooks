import { cn } from "@/lib/utils";
import { PaperTexture } from "@/components/book/paper-texture";

type BookPagesProps = {
  left: React.ReactNode;
  right?: React.ReactNode;
  pageTone?: string;
  className?: string;
};

export function BookPages({
  left,
  right,
  pageTone = "bg-paper",
  className,
}: BookPagesProps) {
  const spread = right != null;

  return (
    <div
      className={cn(
        "relative grid overflow-hidden",
        spread ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1",
        className,
      )}
    >
      <div
        className={cn(
          "relative min-h-[14rem] px-6 py-6 sm:px-8 sm:py-8",
          spread && "lg:pr-10",
          pageTone,
        )}
      >
        <PaperTexture className="opacity-[0.035]" />
        <div className="relative z-[1]">{left}</div>
      </div>
      {spread ? (
        <div
          className={cn(
            "relative min-h-[14rem] border-t border-ink/8 px-6 py-6 sm:px-8 sm:py-8 lg:border-t-0",
            "lg:pl-10",
            pageTone,
          )}
        >
          <PaperTexture className="opacity-[0.035]" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-4 left-0 hidden w-8 bg-gradient-to-r from-ink/8 to-transparent lg:block"
          />
          <div className="relative z-[1]">{right}</div>
        </div>
      ) : null}
    </div>
  );
}
