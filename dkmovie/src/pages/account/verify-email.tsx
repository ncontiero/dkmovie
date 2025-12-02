import { type SubmitHandler, Controller, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { BaseAuthForm } from "@/components/base-auth-form";
import { Meta } from "@/components/meta";
import { ResendEmailCodeButton } from "@/components/resend-email-code-button";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/input-otp";
import { useNextPath } from "@/hooks/use-next-path";
import { useSchemaTranslations } from "@/hooks/use-schema-translations";
import { useSession } from "@/hooks/use-session";
import { verifyEmail } from "@/http/auth/verify-email";
import { HTTPError } from "@/http/client";
import {
  type VerifyEmailSchema,
  verifyEmailSchema,
} from "@/schemas/auth/verify-email";
import { getErrorMessage } from "@/utils/errors";

export default function VerifyEmail() {
  const t = useTranslations("auth.emailVerification.verifyEmail");
  const commonT = useTranslations("common");
  const queryClient = useQueryClient();
  const { setSession } = useSession();
  const navigate = useNavigate();
  const { navigateToNextPath } = useNextPath();

  const { schemaTranslator } = useSchemaTranslations({
    defaultError: commonT("errors.codeIsRequired"),
  });

  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(verifyEmailSchema, { error: schemaTranslator }),
    defaultValues: {
      key: code ?? "",
    },
  });

  const onSubmit: SubmitHandler<VerifyEmailSchema> = async (data) => {
    try {
      const res = await verifyEmail(data);
      setSession(res);
      queryClient.invalidateQueries({ queryKey: ["user-emails"] });
      toast.success(t("success"));
      navigateToNextPath();
    } catch (error) {
      if (error instanceof HTTPError) {
        if (error.status === 409) {
          toast.error(t("dontHave"));
          navigate("/account");
          return;
        }

        const errors = getErrorMessage(error);
        if (errors) toast.error(errors);
        return;
      }

      console.error(error);
      toast.error(commonT("errors.unexpected"));
    }
  };

  return (
    <BaseAuthForm
      title={t("title")}
      description={t("description")}
      formSubmit={handleSubmit(onSubmit)}
      type="verify-email"
    >
      <Meta title={t("title")} />
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center">
          <Controller
            name="key"
            control={control}
            render={({ field }) => (
              <CodeInput
                {...field}
                aria-label={t("enterYourCode")}
                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                autoFocus
                onComplete={() => {
                  handleSubmit(onSubmit)();
                }}
              />
            )}
          />
        </div>
        {errors.key ? (
          <p className="text-destructive text-sm">{errors.key.message}</p>
        ) : null}
      </div>
      <div className="-mt-4 flex items-center justify-center">
        <ResendEmailCodeButton variant="link" text={t("dintReceive")} />
      </div>
      <Button type="submit" className="w-full" size="sm" loading={isSubmitting}>
        {t("verifyEmail")}
      </Button>
    </BaseAuthForm>
  );
}
