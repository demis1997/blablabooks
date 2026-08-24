"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { Announcement } from "@/types/database";
import {
  archiveAnnouncement,
  deleteAnnouncement,
  duplicateAnnouncement,
  publishAnnouncement,
  saveAnnouncement,
  unpublishAnnouncement,
} from "@/lib/actions/announcements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { LivePreview } from "@/components/admin/live-preview";
import { useRouter } from "@/i18n/navigation";

type AnnouncementsAdminProps = {
  announcements: Announcement[];
  mode?: "all" | "meetups" | "notices";
};

const emptyForm = {
  title_en: "",
  title_ru: "",
  description_en: "",
  description_ru: "",
  announcement_type: "meetup" as const,
  event_date: "",
  start_time: "",
  end_time: "",
  venue: "",
  address: "",
  maps_url: "",
  city: "",
  member_instructions: "",
  is_pinned: false,
  status: "draft" as const,
  hide_when_expired: true,
};

export function AnnouncementsAdmin({
  announcements,
  mode = "all",
}: AnnouncementsAdminProps) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isPending, startTransition] = useTransition();
  const visible = announcements.filter((a) => {
    if (mode === "meetups") return a.announcement_type === "meetup";
    if (mode === "notices") return a.announcement_type !== "meetup";
    return true;
  });

  const loadForEdit = (a: Announcement) => {
    setEditingId(a.id);
    setForm({
      title_en: a.title_en,
      title_ru: a.title_ru ?? "",
      description_en: a.description_en ?? "",
      description_ru: a.description_ru ?? "",
      announcement_type: a.announcement_type as typeof emptyForm.announcement_type,
      event_date: a.event_date ?? "",
      start_time: a.start_time ?? "",
      end_time: a.end_time ?? "",
      venue: a.venue ?? "",
      address: a.address ?? "",
      maps_url: a.maps_url ?? "",
      city: a.city ?? "",
      member_instructions: a.member_instructions ?? "",
      is_pinned: a.is_pinned,
      status: a.status as typeof emptyForm.status,
      hide_when_expired: a.hide_when_expired,
    });
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = () => {
    startTransition(() => {
      void (async () => {
        const result = await saveAnnouncement({
          id: editingId ?? undefined,
          title_en: form.title_en,
          title_ru: form.title_ru || null,
          description_en: form.description_en || null,
          description_ru: form.description_ru || null,
          announcement_type:
            mode === "meetups"
              ? "meetup"
              : mode === "notices" && form.announcement_type === "meetup"
                ? "general"
                : form.announcement_type,
          event_date: form.event_date || null,
          start_time: form.start_time || null,
          end_time: form.end_time || null,
          venue: form.venue || null,
          address: form.address || null,
          maps_url: form.maps_url || null,
          city: form.city || null,
          member_instructions: form.member_instructions || null,
          cancelled: false,
          image_url: null,
          publish_at: null,
          expires_at: null,
          is_pinned: form.is_pinned,
          status: form.status,
          hide_when_expired: form.hide_when_expired,
        });
        if (!result.ok) {
          toast.error(result.error ?? t("toasts.error"));
          return;
        }
        toast.success(t("toasts.saved"));
        reset();
        router.refresh();
      })();
    });
  };

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    startTransition(() => {
      void (async () => {
        const result = await fn();
        if (!result.ok) {
          toast.error(result.error ?? t("toasts.error"));
          return;
        }
        toast.success(t("toasts.saved"));
        router.refresh();
      })();
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-ink/8 bg-paper p-6">
        <h2 className="font-display text-xl">
          {editingId ? t("announcements.edit") : t("announcements.add")}
        </h2>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>{t("announcements.titleEn")}</Label>
            <Input
              value={form.title_en}
              onChange={(e) =>
                setForm((f) => ({ ...f, title_en: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("announcements.titleRu")}</Label>
            <Input
              value={form.title_ru}
              onChange={(e) =>
                setForm((f) => ({ ...f, title_ru: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("announcements.descriptionEn")}</Label>
            <Textarea
              rows={3}
              value={form.description_en}
              onChange={(e) =>
                setForm((f) => ({ ...f, description_en: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("announcements.descriptionRu")}</Label>
            <Textarea
              rows={3}
              value={form.description_ru}
              onChange={(e) =>
                setForm((f) => ({ ...f, description_ru: e.target.value }))
              }
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("announcements.type")}</Label>
              <Select
                value={form.announcement_type}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    announcement_type: v as typeof f.announcement_type,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["meetup", "general", "reminder", "other"] as const).map(
                    (type) => (
                      <SelectItem key={type} value={type}>
                        {t(`announcements.types.${type}`)}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("announcements.eventDate")}</Label>
              <Input
                type="date"
                value={form.event_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, event_date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("announcements.startTime")}</Label>
              <Input
                value={form.start_time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, start_time: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("announcements.endTime")}</Label>
              <Input
                value={form.end_time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, end_time: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("announcements.venue")}</Label>
            <Input
              value={form.venue}
              onChange={(e) =>
                setForm((f) => ({ ...f, venue: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("announcements.city")}</Label>
            <Input
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("announcements.address")}</Label>
            <Input
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("announcements.mapsUrl")}</Label>
            <Input
              value={form.maps_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, maps_url: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("announcements.memberInstructions")}</Label>
            <Textarea
              rows={2}
              value={form.member_instructions}
              onChange={(e) =>
                setForm((f) => ({ ...f, member_instructions: e.target.value }))
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.is_pinned}
              onCheckedChange={(c) =>
                setForm((f) => ({ ...f, is_pinned: Boolean(c) }))
              }
              id="pinned"
            />
            <Label htmlFor="pinned">{t("announcements.isPinned")}</Label>
          </div>
          <div className="flex gap-2">
            <Button disabled={isPending || !form.title_en} onClick={submit}>
              {t("forms.save")}
            </Button>
            {editingId ? (
              <Button variant="outline" onClick={reset}>
                {t("forms.cancel")}
              </Button>
            ) : null}
          </div>
          <LivePreview
            english={
              <div>
                <p className="font-display text-xl">{form.title_en || "Title"}</p>
                <p className="mt-2 text-ink-muted">{form.description_en}</p>
                <p className="mt-2 text-xs">
                  {[form.venue, form.city, form.event_date, form.start_time]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            }
            russian={
              <div>
                <p className="font-display text-xl">
                  {form.title_ru || form.title_en || "Заголовок"}
                </p>
                <p className="mt-2 text-ink-muted">
                  {form.description_ru || form.description_en}
                </p>
              </div>
            }
          />
        </div>
      </div>

      <ul className="space-y-3">
        {visible.map((a) => (
          <li
            key={a.id}
            className="rounded-2xl border border-ink/8 bg-paper p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-ink">{a.title_en}</p>
                <p className="text-xs text-ink-muted">
                  {a.status} · {a.announcement_type}
                  {a.event_date ? ` · ${a.event_date}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="ghost" onClick={() => loadForEdit(a)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => run(() => duplicateAnnouncement(a.id))}
                >
                  Duplicate
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() =>
                    run(() =>
                      saveAnnouncement({
                        ...a,
                        id: a.id,
                        cancelled: true,
                        status: a.status,
                      }),
                    )
                  }
                >
                  Cancel
                </Button>
                {a.status !== "published" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isPending}
                    onClick={() => run(() => publishAnnouncement(a.id))}
                  >
                    Publish
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isPending}
                    onClick={() => run(() => unpublishAnnouncement(a.id))}
                  >
                    Unpublish
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => run(() => archiveAnnouncement(a.id))}
                >
                  {t("forms.archive")}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost">
                      {t("forms.delete")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("forms.delete")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("forms.confirmDelete")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("forms.cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => run(() => deleteAnnouncement(a.id))}
                      >
                        {t("forms.delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
