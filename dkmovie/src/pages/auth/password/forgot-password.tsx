import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { BaseAuthForm } from "@/components/base-auth-form";
import { Meta } from "@/components/meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-session";
import { forgotPassword } from "@/http/auth/password";
import {
  type ForgotPasswordSchema,
  forgotPasswordSchema,
} from "@/schemas/auth/password";
import { passwordResetByCodeFlow } from "@/utils/auth-flows";
import { getErrorMessage } from "@/utils/errors";

export default function ForgotPasswordPage() {
  const t = useTranslations("forgotPasswordPage");
  const errorsT = useTranslations("errors");
  const { isAuthenticated } = useSession();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get("email");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: email || "",
    },
  });

  const onSubmit: SubmitHandler<ForgotPasswordSchema> = async (data) => {
    try {
      await forgotPassword(data);
    } catch (error) {
      if (passwordResetByCodeFlow(error)) {
        toast.success(t("checkYourEmail"));
        navigate("/auth/password/reset");
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
      type="forgot-password"
      isAuthenticated={isAuthenticated}
    >
      <Meta title={t("title")} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          type="email"
          id="email"
          placeholder="email@example.com"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-destructive text-sm">{errors.email.message}</p>
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
