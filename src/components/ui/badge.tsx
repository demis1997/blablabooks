import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-ink text-paper",
        secondary: "border-transparent bg-blush/80 text-ink",
        outline: "border-ink/15 bg-transparent text-ink",
        soft: "border-transparent bg-powder/80 text-ink",
        sage: "border-transparent bg-sage/90 text-ink",
        butter: "border-transparent bg-butter/90 text-ink",
        lavender: "border-transparent bg-lavender/80 text-ink",
        muted: "border-transparent bg-ink/8 text-ink-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
