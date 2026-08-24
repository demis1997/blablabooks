import { NextResponse } from "next/server";
import { getAdminSession, sessionIsOwner } from "@/lib/supabase/auth";
import {
  clearOAuthStateCookie,
  exchangeInstagramCode,
  fetchInstagramProfile,
  readOAuthStateCookie,
  verifyOAuthState,
} from "@/lib/instagram/oauth";
import {
  getExistingInstagramUserId,
  saveInstagramConnection,
} from "@/lib/data/instagram";
import { synchronizeInstagramMedia } from "@/lib/instagram/sync";
import { logActivity } from "@/lib/data/activity";
import { revalidatePath } from "next/cache";

function siteOrigin(request: Request): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(request.url).origin;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = siteOrigin(request);
  const locale = url.searchParams.get("locale") || "en";
  const errorPath = `${origin}/${locale}/admin/instagram`;

  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(`${origin}/${locale}/admin/login`);
  }

  const error = url.searchParams.get("error");
  if (error) {
    await clearOAuthStateCookie();
    return NextResponse.redirect(`${errorPath}?error=denied`);
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") ?? "";
  const expected = (await readOAuthStateCookie()) ?? "";
  await clearOAuthStateCookie();

  if (!code || !verifyOAuthState(state, expected, session.profile.id)) {
    return NextResponse.redirect(`${errorPath}?error=state`);
  }

  try {
    const tokens = await exchangeInstagramCode(code);
    const existingId = await getExistingInstagramUserId();
    if (
      existingId &&
      existingId !== tokens.userId &&
      !sessionIsOwner(session)
    ) {
      return NextResponse.redirect(`${errorPath}?error=owner-only`);
    }

    const profile = await fetchInstagramProfile(tokens.accessToken);
    await saveInstagramConnection({
      instagramUserId: profile.id,
      username: profile.username,
      profilePictureUrl: profile.profilePictureUrl,
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
      connectedBy: session.profile.id,
      replace: Boolean(existingId && existingId !== profile.id),
    });

    await logActivity({
      admin_id: session.profile.id,
      action: "instagram.connected",
      entity_type: "instagram",
      entity_id: profile.id,
      details: { username: profile.username },
    });

    await synchronizeInstagramMedia("manual");
    revalidatePath(`/${locale}/admin/instagram`);
    revalidatePath(`/${locale}/gallery`);
    revalidatePath(`/${locale}`);
    return NextResponse.redirect(`${errorPath}?connected=1`);
  } catch {
    return NextResponse.redirect(`${errorPath}?error=exchange`);
  }
}
