import type { ReactNode } from "react";

/**
 * Root layout required by Next.js. Locale layout owns html/body + fonts
 * so `lang` matches the active locale (next-intl App Router pattern).
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
