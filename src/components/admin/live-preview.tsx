"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type LivePreviewProps = {
  english: React.ReactNode;
  russian: React.ReactNode;
};

export function LivePreview({ english, russian }: LivePreviewProps) {
  const t = useTranslations("Admin.preview");
  const [device, setDevice] = useState<"desktop" | "mobile">("mobile");
  const [lang, setLang] = useState<"en" | "ru">("en");

  return (
    <div className="space-y-3 rounded-2xl border border-ink/8 bg-paper p-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={device === "mobile" ? "default" : "outline"}
          onClick={() => setDevice("mobile")}
        >
          {t("mobile")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={device === "desktop" ? "default" : "outline"}
          onClick={() => setDevice("desktop")}
        >
          {t("desktop")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={lang === "en" ? "default" : "outline"}
          onClick={() => setLang("en")}
        >
          EN
        </Button>
        <Button
          type="button"
          size="sm"
          variant={lang === "ru" ? "default" : "outline"}
          onClick={() => setLang("ru")}
        >
          RU
        </Button>
      </div>
      <div
        className={cn(
          "mx-auto overflow-hidden rounded-xl border border-ink/10 bg-paper p-4 text-sm",
          device === "mobile" ? "max-w-[22rem]" : "max-w-3xl",
        )}
      >
        {lang === "en" ? english : russian}
      </div>
    </div>
  );
}
