import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getAdminSession } from "@/lib/supabase/auth";
import { canAccessAdmin } from "@/lib/supabase/auth-guard";
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

  const session = await getAdminSession();
  if (
    session &&
    canAccessAdmin({
      isSupabaseConfigured: isSupabaseConfigured(),
      hasDemoCookie: "demo" in session,
      profile: session.profile,
    })
  ) {
    redirect(`/${locale}/admin`);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-12">
      <h1 className="sr-only">{t("loginTitle")}</h1>
      <LoginForm supabaseConfigured={isSupabaseConfigured()} />
    </div>
  );
}
