"use client";

import { PaperTexture } from "@/components/book/paper-texture";
import { ACCENT_FILL } from "./palette";

type PopupBookProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function PopupBook({ title, subtitle, children }: PopupBookProps) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="relative overflow-hidden rounded-xl border border-ink/10 bg-paper shadow-[12px_22px_40px_rgb(48_44_53/0.14)]">
        <div
          aria-hidden
          className={`book-cloth px-6 py-5 text-center ${ACCENT_FILL.blush}`}
        >
          <PaperTexture className="opacity-[0.07]" />
          <h1 className="relative font-display text-3xl text-ink sm:text-4xl">
            {title}
          </h1>
          <p className="relative mt-2 text-sm text-ink/80">{subtitle}</p>
        </div>
        <div className="relative px-4 py-8 sm:px-8">
          <PaperTexture className="opacity-[0.03]" />
          <div className="relative">{children}</div>
        </div>
      </section>
    </div>
  );
}
