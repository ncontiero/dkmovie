import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { BaseAuthForm } from "@/components/base-auth-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/components/ui/link";
import { PasswordInput } from "@/components/ui/password-input";
import { useMFA } from "@/hooks/use-mfa";
import { useNextPath } from "@/hooks/use-next-path";
import { useSchemaTranslations } from "@/hooks/use-schema-translations";
import { signIn } from "@/http/auth/sign-in";
import { type SignInSchema, signInSchema } from "@/schemas/auth/sign-in";
import { need2FA, needEmailVerification } from "@/utils/auth-flows";
import { getErrorMessage } from "@/utils/errors";
import { generateMetadata } from "@/utils/metadata";

export const Route = createFileRoute("/auth/sign-in")({
  component: SignInComponent,
  head: ({
    match: {
      context: { metadataTranslations },
    },
  }) =>
    generateMetadata({
      metadataTranslations,
      title: metadataTranslations("signIn"),
    }),
});

function SignInComponent() {
  const t = useTranslations("singInPage");
  const commonT = useTranslations("common");

  const router = useRouter();
  const { setSession } = Route.useRouteContext({
    select: (search) => search.auth,
  });
  const { initializeMFAIfNecessary } = useMFA();
  const navigate = Route.useNavigate();
  const { nextPath, navigateToNextPath } = useNextPath();

  const { schemaTranslator } = useSchemaTranslations<SignInSchema>({
    defaultError: commonT("errors.invalid"),
    messages: {
      email: commonT("errors.invalidEmail"),
      password: commonT("errors.password.isRequired"),
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signInSchema, { error: schemaTranslator }),
  });

  const onSubmit: SubmitHandler<SignInSchema> = async (data) => {
    try {
      const res = await signIn(data);
      setSession(res);
      await router.invalidate({ forcePending: true });
      await navigateToNextPath();
    } catch (error) {
      if (needEmailVerification(error)) {
        toast.success(commonT("emailVerification.title"), {
          description: commonT("emailVerification.description"),
        });
        navigate({ to: "/account/verify-email", search: { next: nextPath } });
        return;
      }

      if (need2FA(error)) {
        initializeMFAIfNecessary(error, nextPath);
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
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{commonT("fields.password")}</Label>
          <Link to="/auth/password/forgot" size="sm">
            {t("forgotPassword")}
          </Link>
        </div>
        <PasswordInput
          id="password"
          placeholder={commonT("fields.passwordPlaceholder")}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
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
