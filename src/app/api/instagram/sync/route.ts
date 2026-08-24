import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/supabase/auth";
import { synchronizeInstagramMedia } from "@/lib/instagram/sync";
import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";

export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await synchronizeInstagramMedia("manual");
  const locale = await getLocale().catch(() => "en");
  revalidatePath(`/${locale}/admin/instagram`);
  revalidatePath(`/${locale}/admin/gallery`);
  revalidatePath(`/${locale}/gallery`);
  revalidatePath(`/${locale}`);

  return NextResponse.json({
    ok: result.ok,
    error: result.error,
    fetched: result.fetched,
    added: result.added,
    skipped: result.skipped,
    failed: result.failed,
    requiresReconnect: result.requiresReconnect ?? false,
  });
}
