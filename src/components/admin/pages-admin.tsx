"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { EditablePage } from "@/types/database";
import { savePage } from "@/lib/actions/pages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";

type PagesAdminProps = {
  page: EditablePage;
};

export function PagesAdmin({ page }: PagesAdminProps) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [titleEn, setTitleEn] = useState(page.title_en);
  const [titleRu, setTitleRu] = useState(page.title_ru ?? "");
  const [contentEn, setContentEn] = useState(page.content_en);
  const [contentRu, setContentRu] = useState(page.content_ru ?? "");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4 rounded-2xl border border-ink/8 bg-paper p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl">{t("pages.editPage")}</h2>
        <p className="text-xs text-ink-muted">
          {t("pages.lastUpdated")}:{" "}
          {new Date(page.updated_at).toLocaleString()}
        </p>
      </div>
      <div className="space-y-1.5">
        <Label>{t("pages.slug")}</Label>
        <Input value={page.slug} disabled />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t("pages.titleEn")}</Label>
          <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("pages.titleRu")}</Label>
          <Input value={titleRu} onChange={(e) => setTitleRu(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("pages.contentEn")}</Label>
          <Textarea
            rows={16}
            value={contentEn}
            onChange={(e) => setContentEn(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t("pages.contentRu")}</Label>
          <Textarea
            rows={16}
            value={contentRu}
            onChange={(e) => setContentRu(e.target.value)}
          />
        </div>
      </div>
      <Button
        disabled={isPending}
        onClick={() => {
          startTransition(() => {
            void (async () => {
              const result = await savePage({
                slug: page.slug,
                title_en: titleEn,
                title_ru: titleRu || null,
                content_en: contentEn,
                content_ru: contentRu || null,
              });
              if (!result.ok) {
                toast.error(result.error ?? t("toasts.error"));
                return;
              }
              toast.success(t("toasts.saved"));
              router.refresh();
            })();
          });
        }}
      >
        {t("forms.save")}
      </Button>
    </div>
  );
}
