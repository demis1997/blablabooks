/**
 * Minimal safe markdown → HTML for editable pages.
 * Supports: ## / ### headings, paragraphs, [links](url).
 * Escapes HTML in text content; only allows http(s) and mailto links.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isSafeHref(href: string): boolean {
  const trimmed = href.trim();
  return (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("/")
  );
}

function renderInline(text: string): string {
  const escaped = escapeHtml(text);
  return escaped.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, label: string, href: string) => {
      if (!isSafeHref(href)) {
        return label;
      }
      const safeHref = escapeHtml(href.trim());
      return `<a href="${safeHref}" class="underline decoration-blush/80 underline-offset-4 hover:text-ink transition-colors" rel="noopener noreferrer" target="_blank">${label}</a>`;
    },
  );
}

/**
 * Convert a small markdown subset into HTML suitable for dangerouslySetInnerHTML.
 */
export function markdownToHtml(markdown: string): string {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";

  const blocks = normalized.split(/\n{2,}/);
  const html: string[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trimEnd());
    const first = lines[0]?.trim() ?? "";

    if (first.startsWith("### ")) {
      const title = first.slice(4);
      const rest = lines.slice(1).join(" ").trim();
      html.push(
        `<h3 class="font-display text-xl text-ink mt-8 mb-3">${renderInline(title)}</h3>`,
      );
      if (rest) {
        html.push(
          `<p class="text-ink-muted leading-relaxed mb-4">${renderInline(rest)}</p>`,
        );
      }
      continue;
    }

    if (first.startsWith("## ")) {
      const title = first.slice(3);
      const rest = lines.slice(1).join(" ").trim();
      html.push(
        `<h2 class="font-display text-2xl md:text-3xl text-ink mt-10 mb-4 first:mt-0">${renderInline(title)}</h2>`,
      );
      if (rest) {
        html.push(
          `<p class="text-ink-muted leading-relaxed mb-4">${renderInline(rest)}</p>`,
        );
      }
      continue;
    }

    if (first.startsWith("# ")) {
      const title = first.slice(2);
      html.push(
        `<h1 class="font-display text-3xl md:text-4xl text-ink mb-6">${renderInline(title)}</h1>`,
      );
      const rest = lines.slice(1).join(" ").trim();
      if (rest) {
        html.push(
          `<p class="text-ink-muted leading-relaxed mb-4">${renderInline(rest)}</p>`,
        );
      }
      continue;
    }

    const paragraph = lines.join(" ").trim();
    if (paragraph) {
      html.push(
        `<p class="text-ink-muted leading-relaxed mb-4">${renderInline(paragraph)}</p>`,
      );
    }
  }

  return html.join("\n");
}
