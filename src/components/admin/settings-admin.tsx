"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { SiteSettings } from "@/types/database";
import { saveSettings } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "@/i18n/navigation";

type SettingsAdminProps = {
  settings: SiteSettings;
};

export function SettingsAdmin({ settings }: SettingsAdminProps) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [siteName, setSiteName] = useState(settings.site_name);
  const [instagramUrl, setInstagramUrl] = useState(settings.instagram_url);
  const [logoUrl, setLogoUrl] = useState(settings.logo_url ?? "");
  const [publicRandomizer, setPublicRandomizer] = useState(
    settings.public_randomizer_enabled,
  );
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-ink/8 bg-paper p-6">
      <h1 className="font-display text-3xl text-ink">{t("settings.title")}</h1>

      <div className="space-y-1.5">
        <Label>{t("settings.siteName")}</Label>
        <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>{t("settings.instagramUrl")}</Label>
        <Input
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>{t("settings.logoUrl")}</Label>
        <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
      </div>
      <div className="flex items-center justify-between gap-4 rounded-xl border border-ink/8 px-4 py-3">
        <div>
          <p className="text-sm font-medium">{t("settings.publicRandomizer")}</p>
          <p className="text-xs text-ink-muted">
            {t("settings.publicRandomizerHint")}
          </p>
        </div>
        <Switch
          checked={publicRandomizer}
          onCheckedChange={setPublicRandomizer}
        />
      </div>

      <Button
        disabled={isPending}
        onClick={() => {
          startTransition(() => {
            void (async () => {
              const result = await saveSettings({
                site_name: siteName,
                instagram_url: instagramUrl,
                logo_url: logoUrl || null,
                public_randomizer_enabled: publicRandomizer,
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
