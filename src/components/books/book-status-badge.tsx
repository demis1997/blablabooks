"use client";

import { useTranslations } from "next-intl";
import type { BookStatus } from "@/types/database";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<BookStatus, NonNullable<BadgeProps["variant"]>> = {
  candidate: "soft",
  currently_reading: "secondary",
  previously_read: "sage",
  archived: "muted",
};

interface BookStatusBadgeProps {
  status: BookStatus;
  label?: string;
  className?: string;
}

export function BookStatusBadge({
  status,
  label,
  className,
}: BookStatusBadgeProps) {
  const t = useTranslations("Books.status");
  const text = label ?? t(status);

  return (
    <Badge
      variant={STATUS_VARIANT[status]}
      className={cn("capitalize", className)}
    >
      {text}
    </Badge>
  );
}
