import { getTranslations, setRequestLocale } from "next-intl/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LoginForm } from "@/components/admin/login-form";
import type { Locale } from "@/lib/constants";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminLoginPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin" });

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-12">
      <h1 className="sr-only">{t("loginTitle")}</h1>
      <LoginForm supabaseConfigured={isSupabaseConfigured()} />
    </div>
  );
}
