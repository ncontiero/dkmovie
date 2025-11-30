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
import { PasswordInput } from "@/components/ui/password-input";
import { useNextPath } from "@/hooks/use-next-path";
import { useSession } from "@/hooks/use-session";
import { signUp } from "@/http/auth/sign-up";
import { type SignUpSchema, signUpSchema } from "@/schemas/auth/sign-up";
import { needEmailVerification } from "@/utils/auth-flows";
import { getErrorMessage } from "@/utils/errors";

export default function SignUpPage() {
  const t = useTranslations("singUpPage");
  const commonT = useTranslations("common");
  const { isAuthenticated, setSession } = useSession();
  const navigate = useNavigate();
  const { nextPath, navigateToNextPath } = useNextPath();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signUpSchema),
  });

  if (isAuthenticated) return null;

  const onSubmit: SubmitHandler<SignUpSchema> = async (data) => {
    try {
      const res = await signUp(data);
      setSession(res);
      toast.success(t("accountCreated"), {
        description: commonT("emailVerification.description"),
      });
      navigateToNextPath();
    } catch (error) {
      if (needEmailVerification(error)) {
        toast.success(t("accountCreated"), {
          description: commonT("emailVerification.description"),
        });
        navigate(`/account/verify-email?next=${nextPath}`);
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
      <Meta title={commonT("signUp")} />
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
