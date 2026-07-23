import { type SubmitHandler, Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { BaseAuthForm } from "@/components/base-auth-form";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useInvalidPasswordMessages } from "@/hooks/schemas/use-invalid-password-messages";
import { useSchemaTranslations } from "@/hooks/use-schema-translations";
import { resetPassword } from "@/http/auth/password";
import {
  type ResetPasswordSchema,
  resetPasswordSchema,
} from "@/schemas/auth/password";
import { codeSearchSchema } from "@/schemas/routes/code";
import {
  getErrorMessage,
  isHttpConflict,
  isHttpUnauthorized,
} from "@/utils/errors";
import { generateMetadata } from "@/utils/metadata";

export const Route = createFileRoute("/auth/password/reset")({
  component: ResetPasswordComponent,
  validateSearch: (search) => codeSearchSchema.parse(search),
  head: ({
    match: {
      context: { metadataTranslations },
    },
  }) =>
    generateMetadata({
      metadataTranslations,
      title: metadataTranslations("resetPassword"),
    }),
});

function ResetPasswordComponent() {
  const t = useTranslations("resetPasswordPage");
  const commonT = useTranslations("common");

  const { setSession } = Route.useRouteContext({
    select: (search) => search.auth,
  });
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

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

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema, { error: schemaTranslator }),
    defaultValues: {
      key: searchParams.code ?? "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit: SubmitHandler<ResetPasswordSchema> = async (data) => {
    try {
      await resetPassword(data);
    } catch (error) {
      if (isHttpConflict(error)) {
        toast.error(t("expiredOrInvalidCode"));
        navigate({ to: "/auth/password/forgot" });
        return;
      }

      if (isHttpUnauthorized(error)) {
        setSession(null);
        toast.success(t("passwordResetSuccessful"), {
          description: t("passwordResetSuccessfulDescription"),
        });
        navigate({ to: "/auth/sign-in" });
        return;
      }

      const errors = getErrorMessage(error);
      if (errors) {
        toast.error(errors);
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
          <p className="text-sm text-destructive">{errors.key.message}</p>
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
          <p className="text-sm text-destructive">{errors.password.message}</p>
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
          <p className="text-sm text-destructive">
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
