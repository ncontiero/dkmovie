import type { AuthFormWithCodeProps, AuthWithCodeProps } from "./types";
import type { PropsWithChildren } from "react";
import { useNavigate } from "react-router";
import { Loader } from "lucide-react";
import { useTranslations } from "use-intl";
import { useMFA } from "@/hooks/use-mfa";
import { BaseAuthForm } from "../base-auth-form";
import { Meta } from "../meta";
import { Button } from "../ui/button";
import { Link } from "../ui/link";

interface AuthenticateWithCodeProps
  extends AuthWithCodeProps,
    PropsWithChildren,
    AuthFormWithCodeProps {}

export function AuthenticateWithCode({
  type,
  description,
  children,
  isSubmitting = false,
}: AuthenticateWithCodeProps) {
  const t = useTranslations("auth");
  const { mFATypes } = useMFA();
  const navigate = useNavigate();

  if (!mFATypes.includes(type)) {
    navigate("/auth/2fa", { replace: true });
    return null;
  }

  const title = t("mfa.title");

  return (
    <BaseAuthForm title={title} description={description} type="2fa">
      <Meta title={title} />
      <div className="flex flex-col gap-2">{children}</div>
      <Button
        type="submit"
        className="mt-2 w-full"
        size="sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? <Loader className="animate-spin" /> : t("signIn")}
      </Button>
      <div className="flex items-center justify-center">
        <Link to="/auth/2fa" size="sm">
          {t("mfa.useAnotherMethod")}
        </Link>
      </div>
    </BaseAuthForm>
  );
}
