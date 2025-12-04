import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { BaseAuthForm } from "@/components/base-auth-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useInvalidPasswordMessages } from "@/hooks/schemas/use-invalid-password-messages";
import { useNextPath } from "@/hooks/use-next-path";
import { useSchemaTranslations } from "@/hooks/use-schema-translations";
import { signUp } from "@/http/auth/sign-up";
import { type SignUpSchema, signUpSchema } from "@/schemas/auth/sign-up";
import { needEmailVerification } from "@/utils/auth-flows";
import { getErrorMessage } from "@/utils/errors";
import { generateMetadata } from "@/utils/metadata";

export const Route = createFileRoute("/auth/sign-up")({
  component: SingUpComponent,
  head: ({
    match: {
      context: { metadataTranslations },
    },
  }) =>
    generateMetadata({
      metadataTranslations,
      title: metadataTranslations("signUp"),
    }),
});

function SingUpComponent() {
  const t = useTranslations("singUpPage");
  const commonT = useTranslations("common");

  const { setSession } = Route.useRouteContext({
    select: (search) => search.auth,
  });
  const router = useRouter();
  const navigate = Route.useNavigate();
  const { nextPath, navigateToNextPath } = useNextPath();

  const { invalidPasswordMessages, invalidConfirmPasswordMessages } =
    useInvalidPasswordMessages();
  const { schemaTranslator } = useSchemaTranslations<SignUpSchema>({
    defaultError: commonT("errors.invalid"),
    messages: {
      email: commonT("errors.invalidEmail"),
      password: invalidPasswordMessages,
      confirmPassword: invalidConfirmPasswordMessages,
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signUpSchema, { error: schemaTranslator }),
  });

  const onSubmit: SubmitHandler<SignUpSchema> = async (data) => {
    try {
      const res = await signUp(data);
      setSession(res);
      await router.invalidate({ forcePending: true });

      toast.success(t("accountCreated"), {
        description: commonT("emailVerification.description"),
      });
      await navigateToNextPath();
    } catch (error) {
      if (needEmailVerification(error)) {
        toast.success(t("accountCreated"), {
          description: commonT("emailVerification.description"),
        });
        navigate({ to: "/account/verify-email", search: { next: nextPath } });
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
      type="sign-up"
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
          <p className="text-destructive text-sm">{errors.email.message}</p>
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
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p className="text-destructive text-sm">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>
      <Button
        type="submit"
        className="mt-2 w-full"
        size="sm"
        loading={isSubmitting}
      >
        {commonT("signUp")}
      </Button>
    </BaseAuthForm>
  );
}
