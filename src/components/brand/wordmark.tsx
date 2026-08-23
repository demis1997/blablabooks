import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { SITE_NAME } from "@/lib/constants";
import { Star, Underline } from "@/components/brand/decorative";

interface WordmarkProps {
  className?: string;
  href?: string;
  showUnderline?: boolean;
}

export function Wordmark({
  className,
  href = "/",
  showUnderline = true,
}: WordmarkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex flex-col items-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-sm",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
        {SITE_NAME}
        <Star className="size-3.5 text-blush opacity-80 transition-opacity group-hover:opacity-100" />
      </span>
      {showUnderline ? (
        <Underline
          className="mt-0.5 h-2.5 w-full max-w-[7.5rem] text-powder"
          aria-hidden
        />
      ) : null}
    </Link>
  );
}
