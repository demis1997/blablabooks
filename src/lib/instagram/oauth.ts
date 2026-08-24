import { cookies } from "next/headers";
import { createOAuthState as signOAuthState, verifyOAuthState } from "./oauth-state";

export { verifyOAuthState };

export const INSTAGRAM_SCOPES = ["instagram_business_basic"].join(",");

export const OAUTH_STATE_COOKIE = "bbb_ig_oauth_state";

export function isInstagramOAuthConfigured(): boolean {
  return Boolean(
    process.env.INSTAGRAM_APP_ID?.trim() &&
      process.env.INSTAGRAM_APP_SECRET?.trim() &&
      process.env.INSTAGRAM_REDIRECT_URI?.trim(),
  );
}

export function getInstagramOAuthConfig() {
  const appId = process.env.INSTAGRAM_APP_ID?.trim();
  const appSecret = process.env.INSTAGRAM_APP_SECRET?.trim();
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI?.trim();
  if (!appId || !appSecret || !redirectUri) {
    throw new Error("Instagram OAuth is not configured.");
  }
  return { appId, appSecret, redirectUri };
}

export function createOAuthState(adminId: string): string {
  return signOAuthState(
    adminId,
    process.env.INSTAGRAM_APP_SECRET ?? "unconfigured",
  );
}

export function buildInstagramAuthorizeUrl(state: string): string {
  const { appId, redirectUri } = getInstagramOAuthConfig();
  const url = new URL("https://www.instagram.com/oauth/authorize");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", INSTAGRAM_SCOPES);
  url.searchParams.set("state", state);
  url.searchParams.set("enable_fb_login", "0");
  url.searchParams.set("force_authentication", "1");
  return url.toString();
}

export async function setOAuthStateCookie(state: string) {
  const store = await cookies();
  store.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
}

export async function readOAuthStateCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(OAUTH_STATE_COOKIE)?.value;
}

export async function clearOAuthStateCookie() {
  const store = await cookies();
  store.delete(OAUTH_STATE_COOKIE);
}

export type TokenExchangeResult = {
  userId: string;
  accessToken: string;
  expiresIn: number;
};

export async function exchangeInstagramCode(
  code: string,
): Promise<TokenExchangeResult> {
  const { appId, appSecret, redirectUri } = getInstagramOAuthConfig();

  const shortLived = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    }),
  });

  const shortJson = (await shortLived.json()) as {
    access_token?: string;
    user_id?: string | number;
    error_message?: string;
    error_type?: string;
  };

  if (!shortLived.ok || !shortJson.access_token || !shortJson.user_id) {
    throw new Error("Could not complete Instagram authorization.");
  }

  const longUrl = new URL("https://graph.instagram.com/access_token");
  longUrl.searchParams.set("grant_type", "ig_exchange_token");
  longUrl.searchParams.set("client_secret", appSecret);
  longUrl.searchParams.set("access_token", shortJson.access_token);

  const longLived = await fetch(longUrl);
  const longJson = (await longLived.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  return {
    userId: String(shortJson.user_id),
    accessToken: longJson.access_token ?? shortJson.access_token,
    expiresIn: longJson.expires_in ?? 60 * 60 * 24 * 60,
  };
}

export async function refreshLongLivedToken(accessToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
} | null> {
  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", accessToken);
  const res = await fetch(url);
  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message?: string };
  };
  if (!res.ok || !json.access_token) return null;
  return {
    accessToken: json.access_token,
    expiresIn: json.expires_in ?? 60 * 60 * 24 * 60,
  };
}

export async function fetchInstagramProfile(accessToken: string): Promise<{
  id: string;
  username: string | null;
  profilePictureUrl: string | null;
}> {
  const url = new URL("https://graph.instagram.com/me");
  url.searchParams.set("fields", "id,username,profile_picture_url");
  url.searchParams.set("access_token", accessToken);
  const res = await fetch(url);
  const json = (await res.json()) as {
    id?: string;
    username?: string;
    profile_picture_url?: string;
  };
  if (!res.ok || !json.id) {
    throw new Error("Could not load the Instagram profile.");
  }
  return {
    id: json.id,
    username: json.username ?? null,
    profilePictureUrl: json.profile_picture_url ?? null,
  };
}
