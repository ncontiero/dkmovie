import { type SubmitHandler, Controller, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { BaseAuthForm } from "@/components/base-auth-form";
import { Meta } from "@/components/meta";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useInvalidPasswordMessages } from "@/hooks/schemas/use-invalid-password-messages";
import { useSchemaTranslations } from "@/hooks/use-schema-translations";
import { useSession } from "@/hooks/use-session";
import { resetPassword } from "@/http/auth/password";
import { HTTPError } from "@/http/client";
import {
  type ResetPasswordSchema,
  resetPasswordSchema,
} from "@/schemas/auth/password";
import { getErrorMessage } from "@/utils/errors";

export default function ResetPasswordPage() {
  const t = useTranslations("resetPasswordPage");
  const commonT = useTranslations("common");
  const { setSession } = useSession();
  const navigate = useNavigate();

  const { invalidPasswordMessages, invalidConfirmPasswordMessages } =
    useInvalidPasswordMessages();
  const { schemaTranslator } = useSchemaTranslations<ResetPasswordSchema>({
    defaultError: commonT("errors.invalid"),
    messages: {
      key: commonT("errors.codeIsRequired"),
      password: invalidPasswordMessages,
      passwordConfirmation: invalidConfirmPasswordMessages,
    },
  });

  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema, { error: schemaTranslator }),
    defaultValues: {
      key: code ?? "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit: SubmitHandler<ResetPasswordSchema> = async (data) => {
    try {
      await resetPassword(data);
    } catch (error) {
      if (error instanceof HTTPError) {
        if (error.status === 409) {
          toast.error(t("expiredOrInvalidCode"));
          navigate("/auth/password/forgot");
          return;
        }

        if (error.status === 401) {
          setSession(null);
          toast.success(t("passwordResetSuccessful"), {
            description: t("passwordResetSuccessfulDescription"),
          });
          navigate("/auth/sign-in");
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
      type="reset-password"
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
                codeLength={8}
                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                autoFocus
              />
            )}
          />
        </div>
        {errors.key ? (
          <p className="text-destructive text-sm">{errors.key.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">{commonT("fields.password")}</Label>
        <PasswordInput
          id="password"
          placeholder={commonT("fields.passwordPlaceholder")}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-destructive text-sm">{errors.password.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm-password">
          {commonT("fields.confirmPassword")}
        </Label>
        <PasswordInput
          id="confirm-password"
          placeholder={commonT("fields.passwordPlaceholder")}
          {...register("passwordConfirmation")}
        />
        {errors.passwordConfirmation ? (
          <p className="text-destructive text-sm">
            {errors.passwordConfirmation.message}
          </p>
        ) : null}
      </div>
      <Button
        type="submit"
        className="mt-2 w-full"
        size="sm"
        loading={isSubmitting}
      >
        {t("title")}
      </Button>
    </BaseAuthForm>
  );
}
