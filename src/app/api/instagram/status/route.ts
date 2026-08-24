import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/supabase/auth";
import { getInstagramPublicStatus } from "@/lib/data/instagram";
import { isInstagramOAuthConfigured } from "@/lib/instagram/oauth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const connection = await getInstagramPublicStatus();
  return NextResponse.json({
    configured: isInstagramOAuthConfigured(),
    connection,
  });
}
