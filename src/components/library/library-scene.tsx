"use client";

import { cn } from "@/lib/utils";

type LibrarySceneProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Soft reading table: books sit on a desk, not inside one giant volume.
 */
export function LibraryScene({ children, className }: LibrarySceneProps) {
  return (
    <div
      className={cn(
        "library-scene relative mx-auto w-full max-w-6xl overflow-x-clip px-4 pb-20 pt-4 sm:px-6 sm:pt-6",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <span className="desk-tea-ring absolute left-[8%] top-[18%] hidden h-16 w-16 sm:block" />
        <span className="desk-pencil absolute bottom-[22%] left-[2%] hidden h-24 w-2 rotate-[18deg] sm:block" />
        <span className="desk-flower absolute right-[6%] top-[8%] hidden sm:block" />
        <span className="desk-glasses absolute right-[10%] top-[42%] hidden sm:block" />
        <span className="desk-shelf absolute inset-x-8 top-0 hidden h-2 sm:block" />
      </div>
      <div className="relative flex flex-col gap-16 sm:gap-20 lg:gap-24">
        {children}
      </div>
    </div>
  );
}
