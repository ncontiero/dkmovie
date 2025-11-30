import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { BaseAuthForm } from "@/components/base-auth-form";
import { Meta } from "@/components/meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/components/ui/link";
import { PasswordInput } from "@/components/ui/password-input";
import { useMFA } from "@/hooks/use-mfa";
import { useNextPath } from "@/hooks/use-next-path";
import { useSession } from "@/hooks/use-session";
import { signIn } from "@/http/auth/sign-in";
import { type SignInSchema, signInSchema } from "@/schemas/auth/sign-in";
import { need2FA, needEmailVerification } from "@/utils/auth-flows";
import { getErrorMessage } from "@/utils/errors";

export default function SignInPage() {
  const t = useTranslations("singInPage");
  const emailVerificationT = useTranslations(
    "auth.emailVerification.needVerification",
  );
  const errorsT = useTranslations("errors");
  const { setSession, isAuthenticated } = useSession();
  const { initializeMFAIfNecessary } = useMFA();
  const navigate = useNavigate();
  const { nextPath, navigateToNextPath } = useNextPath();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signInSchema),
  });

  if (isAuthenticated) return null;

  const onSubmit: SubmitHandler<SignInSchema> = async (data) => {
    try {
      const res = await signIn(data);
      setSession(res);
      navigateToNextPath();
    } catch (error) {
      if (needEmailVerification(error)) {
        toast.success(emailVerificationT("title"), {
          description: emailVerificationT("description"),
        });
        navigate(`/account/verify-email?next=${nextPath}`);
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
      toast.error(errorsT("unexpected"));
    }
  };

  return (
    <BaseAuthForm
      title={t("title")}
      description={t("description")}
      formSubmit={handleSubmit(onSubmit)}
    >
      <Meta title={t("title")} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          placeholder="your.email@example.com"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-destructive text-sm">{errors.email.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t("password")}</Label>
          <Link to="/auth/password/forgot" size="sm">
            {t("forgotPassword")}
          </Link>
        </div>
        <PasswordInput
          id="password"
          placeholder={t("passwordPlaceholder")}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-destructive text-sm">{errors.password.message}</p>
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
