"use client";

import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type PublicExperienceProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Public chrome wrapper: desk background.
 * Admin routes render children only (header still comes from layout).
 */
export function PublicExperience({
  children,
  className,
}: PublicExperienceProps) {
  const pathname = usePathname();
  const isAdmin = pathname.includes("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className={cn("book-desk-bg flex min-h-full flex-1 flex-col", className)}>
      {children}
    </div>
  );
}
