"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { GalleryImage } from "@/types/database";
import {
  deleteGalleryImage,
  publishGalleryImage,
  reorderGalleryImages,
  unpublishGalleryImage,
  updateGalleryImage,
  uploadGalleryImages,
} from "@/lib/actions/gallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type GalleryAdminProps = {
  images: GalleryImage[];
};

export function GalleryAdmin({ images: initial }: GalleryAdminProps) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [images, setImages] = useState(initial);
  const [imagesBaseline, setImagesBaseline] = useState(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  if (initial !== imagesBaseline) {
    setImagesBaseline(initial);
    setImages(initial);
  }

  const persistOrder = (next: GalleryImage[]) => {
    setImages(next);
    startTransition(() => {
      void reorderGalleryImages(next.map((img) => img.id));
    });
  };

  const onDropReorder = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const from = images.findIndex((i) => i.id === dragId);
    const to = images.findIndex((i) => i.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    persistOrder(next.map((img, idx) => ({ ...img, sort_order: idx })));
    setDragId(null);
  };

  const onUpload = (files: FileList | null) => {
    if (!files?.length) return;
    const items = Array.from(files).map((file) => {
      const url = URL.createObjectURL(file);
      return {
        public_url: url,
        storage_path: `demo/${file.name}`,
        alt_text: file.name,
      };
    });

    startTransition(() => {
      void (async () => {
        const result = await uploadGalleryImages(items);
        if (!result.ok) {
          toast.error(result.error ?? t("toasts.error"));
          return;
        }
        toast.success(t("toasts.uploadDone"));
        router.refresh();
      })();
    });
  };

  const saveMeta = (
    id: string,
    patch: { caption_en?: string; caption_ru?: string },
  ) => {
    startTransition(() => {
      void (async () => {
        const result = await updateGalleryImage({ id, ...patch });
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
    <div className="space-y-6">
      <div
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-ink/20 bg-paper/60 px-6 py-10 text-center"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onUpload(e.dataTransfer.files);
        }}
      >
        <p className="text-sm text-ink-muted">{t("gallery.dropzone")}</p>
        <p className="mt-1 text-xs text-ink-muted">{t("gallery.optimizeHint")}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onUpload(e.target.files)}
        />
        <Button type="button" className="mt-4" disabled={isPending}>
          {isPending ? t("gallery.uploading") : t("gallery.upload")}
        </Button>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img) => (
          <li
            key={img.id}
            draggable
            onDragStart={() => setDragId(img.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDropReorder(img.id)}
            className={cn(
              "rounded-2xl border border-ink/8 bg-paper p-3 shadow-sm",
              dragId === img.id && "opacity-60",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.public_url}
              alt={img.alt_text ?? ""}
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
            <div className="mt-3 space-y-2">
              <div className="space-y-1">
                <Label className="text-xs">{t("gallery.captionEn")}</Label>
                <Input
                  defaultValue={img.caption_en ?? ""}
                  onBlur={(e) =>
                    saveMeta(img.id, { caption_en: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("gallery.captionRu")}</Label>
                <Input
                  defaultValue={img.caption_ru ?? ""}
                  onBlur={(e) =>
                    saveMeta(img.id, { caption_ru: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {img.status !== "published" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => {
                      startTransition(() => {
                        void publishGalleryImage(img.id).then(() => {
                          toast.success(t("toasts.saved"));
                          router.refresh();
                        });
                      });
                    }}
                  >
                    Publish
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => {
                      startTransition(() => {
                        void unpublishGalleryImage(img.id).then(() => {
                          toast.success(t("toasts.saved"));
                          router.refresh();
                        });
                      });
                    }}
                  >
                    Unpublish
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(() => {
                      void deleteGalleryImage(img.id).then((r) => {
                        if (!r.ok) toast.error(r.error ?? t("toasts.error"));
                        else {
                          toast.success(t("toasts.deleted"));
                          router.refresh();
                        }
                      });
                    });
                  }}
                >
                  {t("gallery.deleteImage")}
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
