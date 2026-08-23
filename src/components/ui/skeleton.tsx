import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-ink/8 motion-safe",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
