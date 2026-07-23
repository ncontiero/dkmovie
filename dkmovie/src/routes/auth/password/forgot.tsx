import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { BaseAuthForm } from "@/components/base-auth-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSchemaTranslations } from "@/hooks/use-schema-translations";
import { forgotPassword } from "@/http/auth/password";
import {
  type ForgotPasswordSchema,
  forgotPasswordSchema,
} from "@/schemas/auth/password";
import { emailSearchSchema } from "@/schemas/routes/email";
import { passwordResetByCodeFlow } from "@/utils/auth-flows";
import { getErrorMessage } from "@/utils/errors";
import { generateMetadata } from "@/utils/metadata";

export const Route = createFileRoute("/auth/password/forgot")({
  component: ForgotPasswordComponent,
  validateSearch: (search) => emailSearchSchema.parse(search),
  head: ({
    match: {
      context: { metadataTranslations },
    },
  }) =>
    generateMetadata({
      metadataTranslations,
      title: metadataTranslations("forgotPassword"),
    }),
});

function ForgotPasswordComponent() {
  const t = useTranslations("forgotPasswordPage");
  const commonT = useTranslations("common");

  const { isAuthenticated } = Route.useRouteContext({
    select: (search) => search.auth,
  });

  const navigate = useNavigate();
  const searchParams = Route.useSearch();

  const { schemaTranslator } = useSchemaTranslations({
    defaultError: commonT("errors.invalidEmail"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema, { error: schemaTranslator }),
    defaultValues: {
      email: searchParams.email || "",
    },
  });

  const onSubmit: SubmitHandler<ForgotPasswordSchema> = async (data) => {
    try {
      await forgotPassword(data);
    } catch (error) {
      if (passwordResetByCodeFlow(error)) {
        toast.success(t("checkYourEmail"));
        navigate({ to: "/auth/password/reset" });
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
      type="forgot-password"
      isAuthenticated={isAuthenticated}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">{commonT("fields.email")}</Label>
        <Input
          type="email"
          id="email"
          placeholder={commonT("fields.emailPlaceholder")}
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>
      <Button
        type="submit"
        className="mt-2 w-full"
        size="sm"
        loading={isSubmitting}
      >
        {t("resetPassword")}
      </Button>
    </BaseAuthForm>
  );
}
