"use client";

import { PaperTexture } from "@/components/book/paper-texture";
import { HandDrawnUnderline } from "@/components/book/hand-drawn-underline";
import { ACCENT_FILL } from "./palette";

type ScrapbookFrameProps = {
  kicker: string;
  title: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
};

export function ScrapbookFrame({
  kicker,
  title,
  children,
  hint,
}: ScrapbookFrameProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <article className="relative overflow-hidden rounded-xl border border-ink/10 bg-[#f3eee6] shadow-[12px_22px_40px_rgb(48_44_53/0.14)]">
        <span aria-hidden className="album-corner left-3 top-3" />
        <span aria-hidden className="album-corner right-3 top-3 rotate-90" />
        <div className={`book-cloth relative px-6 py-6 sm:px-10 ${ACCENT_FILL.sage}`}>
          <PaperTexture className="opacity-[0.07]" />
          <p className="relative font-display text-xs uppercase tracking-[0.2em] text-ink-muted">
            {kicker}
          </p>
          <h1 className="relative mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {title}
          </h1>
          <HandDrawnUnderline className="relative mt-3 max-w-[10rem] text-sage" />
          {hint ? (
            <div className="relative mt-4 max-w-xl text-sm leading-relaxed text-ink/80">
              {hint}
            </div>
          ) : null}
        </div>
        <div className="relative px-4 py-8 sm:px-8">{children}</div>
      </article>
    </div>
  );
}
