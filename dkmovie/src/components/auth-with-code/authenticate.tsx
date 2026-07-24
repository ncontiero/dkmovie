import type { PropsWithChildren } from "react";
import type { AuthFormWithCodeProps, AuthWithCodeProps } from "./types";
import { useNavigate } from "@tanstack/react-router";
import { useTranslations } from "use-intl";
import { useMFA } from "@/hooks/use-mfa";
import { BaseAuthForm } from "../base-auth-form";
import { Button } from "../ui/button";
import { Link } from "../ui/link";

interface AuthenticateWithCodeProps
  extends AuthWithCodeProps, PropsWithChildren, AuthFormWithCodeProps {}

export function AuthenticateWithCode({
  type,
  description,
  children,
  isSubmitting = false,
}: AuthenticateWithCodeProps) {
  const t = useTranslations("auth");
  const commonT = useTranslations("common");

  const { mfaTypes } = useMFA();
  const navigate = useNavigate();

  if (!mfaTypes.includes(type)) {
    navigate({ to: "/auth/2fa", replace: true });
    return null;
  }

  return (
    <BaseAuthForm title={t("mfa.title")} description={description} type="2fa">
      <div className="flex flex-col gap-2">{children}</div>
      <Button
        type="submit"
        className="mt-2 w-full"
        size="sm"
        loading={isSubmitting}
      >
        {commonT("signIn")}
      </Button>
      <div className="flex items-center justify-center">
        <Link to="/auth/2fa" size="sm">
          {t("mfa.useAnotherMethod")}
        </Link>
      </div>
    </BaseAuthForm>
  );
}
