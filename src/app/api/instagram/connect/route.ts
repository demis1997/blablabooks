import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/supabase/auth";
import {
  buildInstagramAuthorizeUrl,
  createOAuthState,
  isInstagramOAuthConfigured,
  setOAuthStateCookie,
} from "@/lib/instagram/oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") || "en";
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || url.origin;

  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(`${origin}/${locale}/admin/login`);
  }

  if (!isInstagramOAuthConfigured()) {
    return NextResponse.redirect(
      `${origin}/${locale}/admin/instagram?error=not-configured`,
    );
  }

  const state = createOAuthState(session.profile.id);
  await setOAuthStateCookie(state);
  return NextResponse.redirect(buildInstagramAuthorizeUrl(state));
}
