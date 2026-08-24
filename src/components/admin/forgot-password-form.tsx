"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  requestPasswordReset,
  type AuthActionResult,
} from "@/lib/actions/auth";
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

export function ForgotPasswordForm() {
  const t = useTranslations("Admin.auth");
  const [state, formAction, pending] = useActionState<
    AuthActionResult | null,
    FormData
  >(requestPasswordReset, null);

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("forgotTitle")}</CardTitle>
        <CardDescription>{t("forgotSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" name="email" type="email" required autoComplete="username" />
          </div>
          {state?.notice ? (
            <p className="text-sm text-ink-muted">{state.notice}</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {t("sendReset")}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link href="/admin/login" className="underline underline-offset-4">
            {t("backToLogin")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
