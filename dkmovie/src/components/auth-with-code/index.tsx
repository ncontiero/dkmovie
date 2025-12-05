import type { ReAuthenticationProps } from "@/context/reauthenticate/context";
import type { AuthWithCodeProps } from "./types";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { useNextPath } from "@/hooks/use-next-path";
import { useSchemaTranslations } from "@/hooks/use-schema-translations";
import { useSession } from "@/hooks/use-session";
import { confirm2FA } from "@/http/auth/2fa";
import { reAuth2FA } from "@/http/auth/re-auth";
import {
  type TwoFactorAuthSchema,
  twoFactorAuthSchema,
} from "@/schemas/auth/2fa";
import { getErrorMessage } from "@/utils/errors";
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

  const router = useRouter();
  const { setSession } = useSession();
  const { navigateToNextPath } = useNextPath();

  const { schemaTranslator } = useSchemaTranslations({
    defaultError: errorT("codeIsRequired"),
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(twoFactorAuthSchema, { error: schemaTranslator }),
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

      await router.invalidate({ forcePending: true });
      await navigateToNextPath();
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
