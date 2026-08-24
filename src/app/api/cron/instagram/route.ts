import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/instagram/cron-auth";
import { synchronizeInstagramMedia } from "@/lib/instagram/sync";
import { getSiteSettings } from "@/lib/data/settings";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const settings = await getSiteSettings();
  if (!settings.instagram_auto_sync) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const result = await synchronizeInstagramMedia("cron");
  revalidatePath("/en/gallery");
  revalidatePath("/ru/gallery");
  revalidatePath("/en");
  revalidatePath("/ru");
  return NextResponse.json({
    ok: result.ok,
    added: result.added,
    skipped: result.skipped,
    failed: result.failed,
    requiresReconnect: result.requiresReconnect ?? false,
  });
}
