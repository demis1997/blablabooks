import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/12 bg-paper/60 px-6 py-14 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 text-ink-muted [&_svg]:size-8">{icon}</div>
      ) : null}
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
