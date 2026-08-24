/**
 * Invite the first owner (Daria) via the Supabase Admin API.
 * Never prints or stores a password — she chooses it from the email link.
 *
 *   npm run create-admin
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
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

async function prompt(question: string, fallback?: string): Promise<string> {
  const arg = process.argv[2]?.trim();
  if (arg && question.toLowerCase().includes("email")) return arg;
  const nameArg = process.argv[3]?.trim();
  if (nameArg && question.toLowerCase().includes("display")) return nameArg;

  if (!input.isTTY) {
    return fallback ?? "";
  }

  const rl = createInterface({ input, output });
  const suffix = fallback ? ` [${fallback}]` : "";
  const answer = (await rl.question(`${question}${suffix}: `)).trim();
  rl.close();
  return answer || fallback || "";
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

if (!url || !serviceKey) {
  console.error(
    "Refusing to run: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-only). No password is created or printed.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const email = await prompt("Owner email");
  const displayName = await prompt("Display name", "Daria");

  if (!email.includes("@")) {
    console.error("A valid email is required.");
    process.exit(1);
  }

  const redirectTo = `${siteUrl.replace(/\/$/, "")}/auth/callback?next=/en/admin/reset-password`;

  const { data: invited, error: inviteError } =
    await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { display_name: displayName },
    });

  let userId = invited.user?.id;

  if (inviteError) {
    const { data: listed, error: listError } =
      await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (listError) {
      throw new Error("Could not invite or look up that user.");
    }
    const existing = listed.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (!existing) {
      throw new Error("Could not invite that user. Check the email and try again.");
    }
    userId = existing.id;
    console.log(`User already exists. Owner role will be assigned to ${email}.`);
  } else {
    console.log(`Invitation sent to ${email}. They will choose their own password.`);
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
      role: "owner",
    },
    { onConflict: "id" },
  );

  if (profileError) {
    throw new Error("Could not assign the owner role.");
  }

  console.log(`Owner role assigned (${displayName}).`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : "Setup failed");
  process.exit(1);
});
