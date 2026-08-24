"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type {
  GalleryImage,
  InstagramConnectionPublic,
  InstagramSyncLog,
  SiteSettings,
} from "@/types/database";
import { bulkUpdateGallery, updateGalleryImage } from "@/lib/actions/gallery";
import { saveSettings } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type InstagramAdminProps = {
  locale: string;
  connection: InstagramConnectionPublic | null;
  oauthConfigured: boolean;
  images: GalleryImage[];
  logs: InstagramSyncLog[];
  settings: SiteSettings;
  isOwner: boolean;
};

export function InstagramAdmin({
  locale,
  connection,
  oauthConfigured,
  images,
  logs,
  settings,
  isOwner,
}: InstagramAdminProps) {
  const t = useTranslations("Admin.instagram");
  const tCommon = useTranslations("Admin");
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [autoSync, setAutoSync] = useState(settings.instagram_auto_sync);
  const [autoPublish, setAutoPublish] = useState(
    settings.instagram_auto_publish,
  );

  const igImages = useMemo(
    () => images.filter((img) => img.source === "instagram"),
    [images],
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulk = (patch: Parameters<typeof bulkUpdateGallery>[1]) => {
    startTransition(() => {
      void (async () => {
        const result = await bulkUpdateGallery([...selected], patch);
        if (!result.ok) {
          toast.error(result.error ?? tCommon("toasts.error"));
          return;
        }
        toast.success(tCommon("toasts.saved"));
        setSelected(new Set());
        router.refresh();
      })();
    });
  };

  const syncNow = () => {
    startTransition(() => {
      void (async () => {
        const res = await fetch("/api/instagram/sync", { method: "POST" });
        const json = (await res.json()) as { ok?: boolean; error?: string };
        if (!json.ok) {
          toast.error(json.error ?? t("syncFailed"));
        } else {
          toast.success(t("syncOk"));
        }
        router.refresh();
      })();
    });
  };

  const disconnect = () => {
    startTransition(() => {
      void (async () => {
        const res = await fetch("/api/instagram/disconnect", { method: "POST" });
        const json = (await res.json()) as { ok?: boolean; error?: string };
        if (!json.ok) {
          toast.error(json.error ?? tCommon("toasts.error"));
          return;
        }
        toast.success(t("disconnected"));
        router.refresh();
      })();
    });
  };

  const persistSettings = (next: {
    instagram_auto_sync?: boolean;
    instagram_auto_publish?: boolean;
  }) => {
    startTransition(() => {
      void saveSettings(next).then((result) => {
        if (!result.ok) toast.error(result.error ?? tCommon("toasts.error"));
        else toast.success(tCommon("toasts.saved"));
        router.refresh();
      });
    });
  };

  const badgeFor = (img: GalleryImage) => {
    if (img.status === "published") return t("published");
    if (img.status === "archived") return t("hidden");
    if (!img.reviewed) return t("unreviewed");
    return t("hidden");
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-ink/8 bg-paper p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          {connection?.profile_picture_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={connection.profile_picture_url}
              alt=""
              className="size-16 rounded-full object-cover"
            />
          ) : null}
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="font-display text-2xl text-ink">
              {connection?.username
                ? `@${connection.username}`
                : t("notConnected")}
            </h2>
            <p className="text-sm text-ink-muted">
              {connection?.requires_reconnect
                ? t("needsReconnect")
                : connection
                  ? t("connected")
                  : t("connectHint")}
            </p>
            {connection?.last_synced_at ? (
              <p className="text-xs text-ink-muted">
                {t("lastSync")}:{" "}
                {new Date(connection.last_synced_at).toLocaleString(locale)}
                {connection.last_sync_message
                  ? ` — ${connection.last_sync_message}`
                  : ""}
              </p>
            ) : null}
            <p className="text-xs text-ink-muted">
              {t("available")}: {igImages.length}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild disabled={!oauthConfigured}>
            <a href={`/api/instagram/connect?locale=${locale}`}>
              {connection ? t("reconnect") : t("connect")}
            </a>
          </Button>
          <Button
            variant="outline"
            disabled={isPending || !connection}
            onClick={syncNow}
          >
            {t("syncNow")}
          </Button>
          {isOwner ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" disabled={isPending || !connection}>
                  {t("disconnect")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("disconnect")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("disconnectConfirm")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{tCommon("forms.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={disconnect}>
                    {t("disconnect")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
        {!oauthConfigured ? (
          <p className="mt-3 text-sm text-ink-muted">{t("missingEnv")}</p>
        ) : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center justify-between gap-3 rounded-2xl border border-ink/8 bg-paper px-4 py-3">
          <span className="text-sm">{t("autoSync")}</span>
          <Switch
            checked={autoSync}
            onCheckedChange={(v) => {
              setAutoSync(v);
              persistSettings({ instagram_auto_sync: v });
            }}
          />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-2xl border border-ink/8 bg-paper px-4 py-3">
          <span className="text-sm">{t("autoPublish")}</span>
          <Switch
            checked={autoPublish}
            onCheckedChange={(v) => {
              setAutoPublish(v);
              persistSettings({ instagram_auto_publish: v });
            }}
          />
        </label>
      </section>

      {selected.size > 0 ? (
        <div className="flex flex-wrap gap-2 rounded-2xl border border-ink/8 bg-paper p-3">
          <Button size="sm" onClick={() => bulk({ status: "published" })}>
            {t("publishSelected")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => bulk({ status: "draft" })}
          >
            {t("hideSelected")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => bulk({ is_featured: true })}
          >
            {t("featureSelected")}
          </Button>
        </div>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {igImages.length === 0 ? (
          <li className="text-sm text-ink-muted">{t("emptyQueue")}</li>
        ) : (
          igImages.map((img) => (
            <li
              key={img.id}
              className={cn(
                "rounded-2xl border border-ink/8 bg-paper p-3",
                selected.has(img.id) && "ring-2 ring-ink/40",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.public_url}
                alt={img.alt_text ?? ""}
                className="aspect-square w-full rounded-xl object-cover"
              />
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge variant="secondary">{badgeFor(img)}</Badge>
                {img.is_featured ? <Badge>{t("featured")}</Badge> : null}
              </div>
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.has(img.id)}
                  onChange={() => toggle(img.id)}
                />
                {t("select")}
              </label>
              <div className="mt-2 space-y-1">
                <Label className="text-xs">{tCommon("gallery.captionEn")}</Label>
                <Input
                  defaultValue={img.caption_en ?? ""}
                  onBlur={(e) => {
                    void updateGalleryImage({
                      id: img.id,
                      caption_en: e.target.value,
                      reviewed: true,
                    });
                  }}
                />
                <Label className="text-xs">{tCommon("gallery.captionRu")}</Label>
                <Input
                  defaultValue={img.caption_ru ?? ""}
                  onBlur={(e) => {
                    void updateGalleryImage({
                      id: img.id,
                      caption_ru: e.target.value,
                      reviewed: true,
                    });
                  }}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {img.instagram_permalink ? (
                  <Button asChild size="sm" variant="ghost">
                    <a
                      href={img.instagram_permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("openOriginal")}
                    </a>
                  </Button>
                ) : null}
              </div>
            </li>
          ))
        )}
      </ul>

      {logs.length > 0 ? (
        <section>
          <h3 className="font-display text-lg">{t("syncHistory")}</h3>
          <ul className="mt-2 divide-y divide-ink/8 rounded-2xl border border-ink/8">
            {logs.map((log) => (
              <li key={log.id} className="px-4 py-2 text-sm">
                {log.status} · {log.message ?? "—"} ·{" "}
                {new Date(log.created_at).toLocaleString(locale)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
