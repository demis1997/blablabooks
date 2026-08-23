import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

type IconProps = SVGProps<SVGSVGElement>;

const base = "shrink-0";

export function Star({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(base, className)}
      aria-hidden
      {...props}
    >
      <path d="M12 3.5l1.9 4.7 5.1.4-3.9 3.4 1.2 5-4.3-2.6-4.3 2.6 1.2-5-3.9-3.4 5.1-.4L12 3.5z" />
    </svg>
  );
}

export function Flower({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(base, className)}
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 4.5c1.2 1.8 1.2 3.8 0 5.5-1.2-1.7-1.2-3.7 0-5.5z" />
      <path d="M12 14c1.2 1.8 1.2 3.8 0 5.5-1.2-1.7-1.2-3.7 0-5.5z" />
      <path d="M4.5 12c1.8-1.2 3.8-1.2 5.5 0-1.7 1.2-3.7 1.2-5.5 0z" />
      <path d="M14 12c1.8-1.2 3.8-1.2 5.5 0-1.7 1.2-3.7 1.2-5.5 0z" />
      <path d="M6.8 6.8c2 .2 3.6 1.4 4.2 3.4-2-.2-3.6-1.4-4.2-3.4z" />
      <path d="M13 13.8c2 .2 3.6 1.4 4.2 3.4-2-.2-3.6-1.4-4.2-3.4z" />
      <path d="M17.2 6.8c-.6 2-2.2 3.2-4.2 3.4 2-.2 3.6-1.4 4.2-3.4z" />
      <path d="M11 13.8c-.6 2-2.2 3.2-4.2 3.4 2-.2 3.6-1.4 4.2-3.4z" />
    </svg>
  );
}

export function BookMark({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(base, className)}
      aria-hidden
      {...props}
    >
      <path d="M7 4.5h7.5a2 2 0 0 1 2 2V19l-5.75-3.2L5.5 19V6.5a2 2 0 0 1 1.5-2z" />
      <path d="M9 8h5" />
    </svg>
  );
}

export function SpeechBubble({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(base, className)}
      aria-hidden
      {...props}
    >
      <path d="M5.5 6.5h13a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H11l-4 3v-3H5.5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z" />
      <path d="M8.5 11.2h7M8.5 14h4.5" />
    </svg>
  );
}

export function Underline({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 120 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={cn(base, className)}
      aria-hidden
      {...props}
    >
      <path d="M2 8c18-4 36 3 54-1s36-4 52 2" />
    </svg>
  );
}

export function Instagram({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(base, className)}
      aria-hidden
      {...props}
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
