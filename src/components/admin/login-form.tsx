"use client";

import { useActionState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { demoLogin, login, type AuthActionResult } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type LoginFormProps = {
  supabaseConfigured: boolean;
};

export function LoginForm({ supabaseConfigured }: LoginFormProps) {
  const t = useTranslations("Admin");
  const [state, formAction, pending] = useActionState<
    AuthActionResult | null,
    FormData
  >(login, null);
  const [demoPending, startDemo] = useTransition();

  if (!supabaseConfigured) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("loginTitle")}</CardTitle>
          <CardDescription>{t("demoModeMessage")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            disabled={demoPending}
            onClick={() => {
              startDemo(() => {
                void demoLogin();
              });
            }}
          >
            {t("demoContinue")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("loginTitle")}</CardTitle>
        <CardDescription>{t("loginSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
            />
          </div>
          {state?.error ? (
            <p className="text-sm text-red-700">{state.error}</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {t("signIn")}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link href="/admin/forgot-password" className="underline underline-offset-4">
            {t("auth.forgotLink")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
