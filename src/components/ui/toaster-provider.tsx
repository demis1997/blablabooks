"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      theme="light"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border border-ink/10 bg-cream text-ink shadow-soft font-sans",
          title: "text-ink font-medium",
          description: "text-ink-muted",
          success: "border-sage/60",
          error: "border-red-200",
          actionButton: "bg-ink text-paper",
          cancelButton: "bg-ink/8 text-ink",
        },
      }}
    />
  );
}
