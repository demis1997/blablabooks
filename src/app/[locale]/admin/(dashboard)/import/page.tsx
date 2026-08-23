import { setRequestLocale } from "next-intl/server";
import { listImportHistory } from "@/lib/actions/import";
import { ImportAdmin } from "@/components/admin/import-admin";
import type { Locale } from "@/lib/constants";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminImportPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);
  const history = await listImportHistory();

  return <ImportAdmin history={history} />;
}
