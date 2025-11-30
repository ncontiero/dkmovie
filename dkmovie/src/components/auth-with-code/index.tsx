import type { ReAuthenticationProps } from "@/context/reauthenticate/context";
import type { AuthWithCodeProps } from "./types";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { useNextPath } from "@/hooks/use-next-path";
import { useSession } from "@/hooks/use-session";
import { confirm2FA } from "@/http/auth/2fa";
import { reAuth2FA } from "@/http/auth/re-auth";
import {
  type TwoFactorAuthSchema,
  twoFactorAuthSchema,
} from "@/schemas/auth/2fa";
import { getErrorMessage, translateZodError } from "@/utils/errors";
import { AuthenticateWithCode } from "./authenticate";
import { CodeInput } from "./code-input";
import { ReAuthWithCode } from "./reauthenticate";

interface AuthenticationWithCodeProps {
  readonly codeType: AuthWithCodeProps["type"];
  readonly type: "2fa" | "reauthenticate";
  readonly reAuthentication?: ReAuthenticationProps;
}

export function AuthWithCode({
  codeType,
  type,
  reAuthentication,
}: AuthenticationWithCodeProps) {
  const t = useTranslations("auth.mfa");
  const errorT = useTranslations("common.errors");
  const { setSession } = useSession();
  const { navigateToNextPath } = useNextPath();

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(twoFactorAuthSchema, {
      error: (iss) =>
        translateZodError({
          iss,
          messages: { code: errorT("codeIsRequired") },
          defaultError: errorT("invalid"),
        }),
    }),
    defaultValues: {
      code: "",
    },
  });

  if (type === "reauthenticate" && !reAuthentication) {
    throw new Error(
      "ReAuthentication component is required when type is 'reauthenticate'",
    );
  }

  const description = codeType === "totp" ? t("totp") : t("recoveryCodes");

  const onSubmitType = (data: TwoFactorAuthSchema) => {
    const fn = type === "2fa" ? confirm2FA : reAuth2FA;
    return fn(data);
  };

  const onSubmit: SubmitHandler<TwoFactorAuthSchema> = async (data) => {
    try {
      const res = await onSubmitType(data);
      setSession(res);

      if (type === "reauthenticate") {
        reAuthentication?.onReAuthenticated?.();
        return;
      }
      navigateToNextPath();
    } catch (error) {
      const errors = getErrorMessage(error);
      if (errors) {
        toast.error(errors);
        return;
      }

      console.error(error);
      toast.error(errorT("unexpected"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {type === "reauthenticate" ? (
        <ReAuthWithCode
          {...reAuthentication}
          description={description}
          type={codeType}
          isSubmitting={isSubmitting}
        >
          <CodeInput
            control={control}
            description={description}
            errors={errors}
            type={codeType}
            onComplete={() => {
              handleSubmit(onSubmit)();
            }}
          />
        </ReAuthWithCode>
      ) : (
        <AuthenticateWithCode
          description={description}
          type={codeType}
          isSubmitting={isSubmitting}
        >
          <CodeInput
            control={control}
            description={description}
            errors={errors}
            type={codeType}
            onComplete={() => {
              handleSubmit(onSubmit)();
            }}
          />
        </AuthenticateWithCode>
      )}
    </form>
  );
}
