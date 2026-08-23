/**
 * Invite/create an Auth user and mark their profile as admin.
 *
 * Usage:
 *   npm run create-admin -- you@example.com
 *   npm run create-admin -- you@example.com "Display Name"
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 *
 * Or use SQL only after the user exists:
 *   UPDATE profiles SET is_admin = true WHERE email = 'you@example.com';
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFiles() {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), name);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

loadEnvFiles();

const email = process.argv[2]?.trim();
const displayName = process.argv[3]?.trim() || null;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

if (!email || !email.includes("@")) {
  console.error("Usage: npm run create-admin -- you@example.com [display name]");
  process.exit(1);
}

if (!url || !serviceKey) {
  console.error(`
Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.

SQL-only alternative after the user signs up:
  UPDATE profiles SET is_admin = true WHERE email = '${email}';
`);
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: invited, error: inviteError } =
    await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl.replace(/\/$/, "")}/en/admin/login`,
      data: displayName ? { display_name: displayName } : undefined,
    });

  let userId = invited.user?.id;

  if (inviteError) {
    // User may already exist — look them up
    const { data: listed, error: listError } =
      await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (listError) {
      throw new Error(
        `Invite failed (${inviteError.message}) and listUsers failed (${listError.message})`,
      );
    }
    const existing = listed.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (!existing) {
      throw new Error(`Invite failed: ${inviteError.message}`);
    }
    userId = existing.id;
    console.log(`User already exists: ${email}`);
  } else {
    console.log(`Invite sent to ${email}`);
  }

  if (!userId) {
    throw new Error("Could not resolve user id");
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email,
      display_name: displayName,
      is_admin: true,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    throw new Error(`Failed to set admin profile: ${profileError.message}`);
  }

  console.log(`Admin flag set for ${email} (${userId})`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
