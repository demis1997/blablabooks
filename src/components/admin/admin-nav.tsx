"use client";

import { useTranslations } from "next-intl";
import {
  BookOpen,
  Dices,
  GalleryVerticalEnd,
  Import,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Settings,
  Bookmark,
  FileText,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/brand/wordmark";

const NAV: Array<{
  href: string;
  labelKey:
    | "overview"
    | "books"
    | "randomizer"
    | "currentBook"
    | "announcements"
    | "gallery"
    | "pages"
    | "settings"
    | "import";
  icon: typeof LayoutDashboard;
  exact?: boolean;
}> = [
  { href: "/admin", labelKey: "overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/books", labelKey: "books", icon: BookOpen },
  { href: "/admin/randomizer", labelKey: "randomizer", icon: Dices },
  { href: "/admin/current-book", labelKey: "currentBook", icon: Bookmark },
  { href: "/admin/announcements", labelKey: "announcements", icon: Megaphone },
  { href: "/admin/gallery", labelKey: "gallery", icon: GalleryVerticalEnd },
  { href: "/admin/pages", labelKey: "pages", icon: FileText },
  { href: "/admin/settings", labelKey: "settings", icon: Settings },
  { href: "/admin/import", labelKey: "import", icon: Import },
];

export function AdminNav() {
  const t = useTranslations("Admin.nav");
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col gap-6 border-b border-ink/10 bg-paper/80 p-4 lg:w-56 lg:border-b-0 lg:border-r lg:min-h-[calc(100vh-4rem)]">
      <div className="px-1">
        <Wordmark href="/admin" className="text-lg" showUnderline={false} />
        <p className="mt-1 text-xs text-ink-muted">Admin</p>
      </div>

      <nav className="flex flex-wrap gap-1 lg:flex-col">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-ink text-paper"
                  : "text-ink-muted hover:bg-ink/5 hover:text-ink",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <form action={logout} className="mt-auto">
        <Button type="submit" variant="ghost" className="w-full justify-start gap-2">
          <LogOut className="size-4" />
          {t("logout")}
        </Button>
      </form>
    </aside>
  );
}
