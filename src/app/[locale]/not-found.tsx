import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("Common");
  const tNav = await getTranslations("Nav");

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <p className="font-display text-6xl text-blush">404</p>
      <h1 className="mt-4 font-display text-3xl text-ink">{t("error")}</h1>
      <p className="mt-3 text-ink-muted">
        This page wandered off the shelf. Try heading home.
      </p>
      <div className="mt-8">
        <Button asChild>
          <Link href="/">{tNav("home")}</Link>
        </Button>
      </div>
    </div>
  );
}
