"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { ImportRecord } from "@/types/database";
import {
  commitImport,
  previewImport,
  type ImportPreviewRow,
} from "@/lib/actions/import";
import { GOOGLE_SHEETS_CSV_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";

const TARGETS = [
  "ignore",
  "title",
  "author",
  "page_count",
  "status",
  "notes",
] as const;

type ImportAdminProps = {
  history: ImportRecord[];
};

type RowState = ImportPreviewRow & {
  skip: boolean;
  overrideDuplicate: boolean;
  acceptedProposalIndex: number | null;
};

export function ImportAdmin({ history }: ImportAdminProps) {
  const t = useTranslations("Admin.import");
  const tToast = useTranslations("Admin.toasts");
  const tForms = useTranslations("Admin.forms");
  const router = useRouter();
  const [url, setUrl] = useState(GOOGLE_SHEETS_CSV_URL);
  const [csvText, setCsvText] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<RowState[]>([]);
  const [report, setReport] = useState<{
    added: number;
    skipped: number;
    duplicates: number;
    failed: number;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const sourceType = csvText ? "csv_upload" : "google_sheets";

  const runPreview = () => {
    startTransition(() => {
      void (async () => {
        const result = await previewImport({
          url: csvText ? undefined : url,
          csvText: csvText ?? undefined,
          filename,
          mapping: Object.keys(mapping).length ? mapping : undefined,
          enrichIncomplete: true,
        });
        if (!result.ok) {
          toast.error(result.error ?? tToast("error"));
          return;
        }
        setHeaders(result.headers ?? []);
        setMapping(result.mapping ?? {});
        setRows(
          (result.rows ?? []).map((r) => ({
            ...r,
            skip: false,
            overrideDuplicate: false,
            acceptedProposalIndex: null,
          })),
        );
        setReport(null);
      })();
    });
  };

  const onFile = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
    setFilename(file.name);
  };

  const canCommit = rows.length > 0;

  const commit = () => {
    startTransition(() => {
      void (async () => {
        const result = await commitImport({
          sourceType,
          sourceUrl: csvText ? null : url,
          filename,
          mapping,
          rows: rows.map((r) => {
            const proposal =
              r.acceptedProposalIndex != null
                ? r.proposals?.[r.acceptedProposalIndex]
                : undefined;
            return {
              title: proposal?.title ?? r.title,
              authors: proposal?.authors ?? r.authors,
              page_count: proposal?.pageCount ?? r.page_count,
              status: r.status,
              notes: r.notes,
              skip: r.skip,
              overrideDuplicate: r.overrideDuplicate,
              acceptedProposal: proposal
                ? {
                    title: proposal.title,
                    authors: proposal.authors,
                    page_count: proposal.pageCount ?? null,
                    isbn_13: proposal.isbn13 ?? null,
                    open_library_work_key: proposal.openLibraryWorkKey ?? null,
                    cover_url: proposal.coverUrl ?? null,
                  }
                : undefined,
            };
          }),
        });
        if (!result.ok || !result.report) {
          toast.error(result.error ?? tToast("error"));
          return;
        }
        setReport(result.report);
        toast.success(tToast("importDone"));
        router.refresh();
      })();
    });
  };

  const ambiguous = useMemo(
    () =>
      rows.filter(
        (r) =>
          r.incomplete &&
          (r.proposals?.length ?? 0) > 0 &&
          r.acceptedProposalIndex == null &&
          !r.skip,
      ),
    [rows],
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-ink/8 bg-paper p-6 lg:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t("googleSheets")}</Label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("csvUpload")}</Label>
          <Input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
          {filename ? (
            <p className="text-xs text-ink-muted">{filename}</p>
          ) : null}
        </div>
        <div className="lg:col-span-2">
          <Button disabled={isPending} onClick={runPreview}>
            {t("preview")}
          </Button>
        </div>
      </div>

      {headers.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-xl">{t("mapColumns")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {headers.map((header) => (
              <div key={header} className="flex items-center gap-2">
                <span className="w-32 truncate text-sm text-ink-muted">
                  {header}
                </span>
                <Select
                  value={mapping[header] ?? "ignore"}
                  onValueChange={(v) =>
                    setMapping((m) => ({ ...m, [header]: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGETS.map((target) => (
                      <SelectItem key={target} value={target}>
                        {target === "ignore"
                          ? t("ignoreColumn")
                          : target === "title"
                            ? t("columnTitle")
                            : target === "author"
                              ? t("columnAuthors")
                              : target === "page_count"
                                ? t("columnPages")
                                : target === "status"
                                  ? t("columnStatus")
                                  : t("columnNotes")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <Button variant="outline" disabled={isPending} onClick={runPreview}>
            Re-preview with mapping
          </Button>
        </section>
      ) : null}

      {rows.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-xl">{t("preview")}</h2>
          {ambiguous.length > 0 ? (
            <p className="rounded-xl border border-amber-500/30 bg-amber-50/80 px-3 py-2 text-sm">
              {ambiguous.length} incomplete row(s) need an Open Library match
              confirmation before import.
            </p>
          ) : null}
          <div className="overflow-auto rounded-2xl border border-ink/8">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-ink/5 text-ink-muted">
                <tr>
                  <th className="p-2">Skip</th>
                  <th className="p-2">{t("columnTitle")}</th>
                  <th className="p-2">{t("columnAuthors")}</th>
                  <th className="p-2">{t("columnPages")}</th>
                  <th className="p-2">Flags</th>
                  <th className="p-2">Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/8">
                {rows.map((row, idx) => (
                  <tr key={row.rowIndex}>
                    <td className="p-2">
                      <Checkbox
                        checked={row.skip}
                        onCheckedChange={(c) =>
                          setRows((rs) =>
                            rs.map((r, i) =>
                              i === idx ? { ...r, skip: Boolean(c) } : r,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="p-2">{row.title || "—"}</td>
                    <td className="p-2">
                      {row.authors.join(", ") || "—"}
                    </td>
                    <td className="p-2">{row.page_count ?? "—"}</td>
                    <td className="p-2 text-xs text-ink-muted">
                      {row.incomplete ? "incomplete " : ""}
                      {row.duplicateIds.length
                        ? `duplicate(${row.duplicateIds.length})`
                        : ""}
                      {row.duplicateIds.length > 0 ? (
                        <label className="mt-1 flex items-center gap-1">
                          <Checkbox
                            checked={row.overrideDuplicate}
                            onCheckedChange={(c) =>
                              setRows((rs) =>
                                rs.map((r, i) =>
                                  i === idx
                                    ? {
                                        ...r,
                                        overrideDuplicate: Boolean(c),
                                      }
                                    : r,
                                ),
                              )
                            }
                          />
                          override
                        </label>
                      ) : null}
                    </td>
                    <td className="p-2">
                      {row.proposals?.length ? (
                        <Select
                          value={
                            row.acceptedProposalIndex != null
                              ? String(row.acceptedProposalIndex)
                              : undefined
                          }
                          onValueChange={(v) =>
                            setRows((rs) =>
                              rs.map((r, i) =>
                                i === idx
                                  ? {
                                      ...r,
                                      acceptedProposalIndex: Number(v),
                                    }
                                  : r,
                              ),
                            )
                          }
                        >
                          <SelectTrigger className="min-w-[180px]">
                            <SelectValue placeholder="Confirm match" />
                          </SelectTrigger>
                          <SelectContent>
                            {row.proposals.map((p, pi) => (
                              <SelectItem key={pi} value={String(pi)}>
                                {p.title} ({p.confidence})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            disabled={isPending || !canCommit || ambiguous.length > 0}
            onClick={commit}
          >
            {t("runImport")}
          </Button>
        </section>
      ) : null}

      {report ? (
        <section className="rounded-2xl border border-ink/8 bg-paper p-6">
          <h2 className="font-display text-xl">{t("report")}</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-4 text-sm">
            <li>
              {t("added")}: {report.added}
            </li>
            <li>
              {t("skipped")}: {report.skipped}
            </li>
            <li>
              {t("duplicates")}: {report.duplicates}
            </li>
            <li>
              {t("failed")}: {report.failed}
            </li>
          </ul>
        </section>
      ) : null}

      {history.length > 0 ? (
        <section>
          <h2 className="font-display text-xl">History</h2>
          <ul className="mt-3 divide-y divide-ink/8 rounded-2xl border border-ink/8">
            {history.map((h) => (
              <li
                key={h.id}
                className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm"
              >
                <span>
                  {h.source_type} · {h.status}
                </span>
                <span className="text-ink-muted">
                  +{h.added_count} / dup {h.duplicate_count} / fail{" "}
                  {h.failed_count}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="sr-only">{tForms("save")}</p>
    </div>
  );
}
