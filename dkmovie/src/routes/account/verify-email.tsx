import { type SubmitHandler, Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { BaseAuthForm } from "@/components/base-auth-form";
import { ResendEmailCodeButton } from "@/components/resend-email-code-button";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/input-otp";
import { useNextPath } from "@/hooks/use-next-path";
import { useSchemaTranslations } from "@/hooks/use-schema-translations";
import { verifyEmail } from "@/http/auth/verify-email";
import {
  type VerifyEmailSchema,
  verifyEmailSchema,
} from "@/schemas/auth/verify-email";
import { codeSearchSchema } from "@/schemas/routes/code";
import { getErrorMessage, isHttpConflict } from "@/utils/errors";
import { generateMetadata } from "@/utils/metadata";

export const Route = createFileRoute("/account/verify-email")({
  component: RouteComponent,
  validateSearch: (search) => codeSearchSchema.parse(search),
  head: ({
    match: {
      context: { metadataTranslations },
    },
  }) =>
    generateMetadata({
      metadataTranslations,
      title: metadataTranslations("verifyEmail"),
    }),
});

function RouteComponent() {
  const t = useTranslations("auth.emailVerification.verifyEmail");
  const commonT = useTranslations("common");

  const {
    queryClient,
    auth: { setSession },
  } = Route.useRouteContext();

  const navigate = Route.useNavigate();
  const searchParams = useSearch({ from: "/account/verify-email" });
  const { navigateToNextPath } = useNextPath();

  const { schemaTranslator } = useSchemaTranslations({
    defaultError: commonT("errors.codeIsRequired"),
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(verifyEmailSchema, { error: schemaTranslator }),
    defaultValues: {
      key: searchParams.code ?? "",
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
      if (isHttpConflict(error)) {
        toast.error(t("dontHave"));
        navigate({ to: "/account" });
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
      type="verify-email"
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
          <p className="text-sm text-destructive">{errors.key.message}</p>
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
