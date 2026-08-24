import { NextResponse } from "next/server";
import { getAdminSession, sessionIsOwner } from "@/lib/supabase/auth";
import { deleteInstagramConnection } from "@/lib/data/instagram";
import { logActivity } from "@/lib/data/activity";
import { FRIENDLY_ERRORS } from "@/lib/auth/errors";
import { revalidatePath } from "next/cache";

export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!sessionIsOwner(session)) {
    return NextResponse.json(
      { ok: false, error: FRIENDLY_ERRORS.ownerOnly },
      { status: 403 },
    );
  }

  await deleteInstagramConnection();
  await logActivity({
    admin_id: session.profile.id,
    action: "instagram.disconnected",
    entity_type: "instagram",
    entity_id: null,
    details: {},
  });
  revalidatePath("/en/admin/instagram");
  revalidatePath("/ru/admin/instagram");
  return NextResponse.json({ ok: true });
}
