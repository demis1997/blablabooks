"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { updatePassword, type AuthActionResult } from "@/lib/actions/auth";
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

export function ResetPasswordForm() {
  const t = useTranslations("Admin.auth");
  const [state, formAction, pending] = useActionState<
    AuthActionResult | null,
    FormData
  >(updatePassword, null);

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("resetTitle")}</CardTitle>
        <CardDescription>{t("resetSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">{t("newPassword")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">{t("confirmPassword")}</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
          {state?.error ? (
            <p className="text-sm text-red-700">{state.error}</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {t("savePassword")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
