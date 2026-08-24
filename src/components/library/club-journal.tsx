"use client";

import { PaperTexture } from "@/components/book/paper-texture";
import { ACCENT_FILL } from "./palette";

type ClubJournalProps = {
  children: React.ReactNode;
};

export function ClubJournal({ children }: ClubJournalProps) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <article className="relative overflow-hidden rounded-sm border border-ink/12 bg-paper shadow-[10px_20px_36px_rgb(48_44_53/0.12)]">
        <div
          aria-hidden
          className={`absolute inset-y-0 left-0 w-3 ${ACCENT_FILL.lavender}`}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-8 w-px bg-blush/50"
        />
        <PaperTexture className="opacity-[0.035]" />
        <div className="relative px-6 py-8 pl-12 sm:px-10 sm:py-10 sm:pl-16">
          {children}
        </div>
      </article>
    </div>
  );
}
