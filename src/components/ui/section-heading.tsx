import { cn } from "@/lib/utils";
import { Underline } from "@/components/brand/decorative";

interface SectionHeadingProps {
  title: string;
  description?: string;
  underline?: boolean;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2" | "h3";
}

export function SectionHeading({
  title,
  description,
  underline = true,
  align = "left",
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <Tag className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {title}
      </Tag>
      {underline ? (
        <Underline
          className={cn(
            "mt-2 h-3 w-28 text-blush",
            align === "center" && "mx-auto",
          )}
          aria-hidden
        />
      ) : null}
      {description ? (
        <p className="mt-3 text-base text-ink-muted sm:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
