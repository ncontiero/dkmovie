import { type SubmitHandler, Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { BaseAuthForm } from "@/components/base-auth-form";
import { Meta } from "@/components/meta";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/input-otp";
import { Link } from "@/components/ui/link";
import { useMFA } from "@/hooks/use-mfa";
import { useNextPath } from "@/hooks/use-next-path";
import { useSession } from "@/hooks/use-session";
import { confirm2FA } from "@/http/auth/2fa";
import {
  type TwoFactorAuthSchema,
  twoFactorAuthSchema,
} from "@/schemas/auth/2fa";
import { getErrorMessage } from "@/utils/errors";

interface BaseAuthFormWithCodeProps {
  readonly type: "totp" | "recovery_codes";
}

export function BaseAuthFormWithCode({ type }: BaseAuthFormWithCodeProps) {
  const { setSession } = useSession();
  const { mFATypes } = useMFA();
  const { navigateToNextPath } = useNextPath();
  const navigate = useNavigate();

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(twoFactorAuthSchema),
    defaultValues: {
      code: "",
    },
  });

  if (!mFATypes.includes(type)) {
    navigate("/auth/2fa", { replace: true });
    return null;
  }

  const description =
    type === "totp"
      ? "Please enter the code from your authenticator app"
      : "Please enter one of your recovery codes";

  const onSubmit: SubmitHandler<TwoFactorAuthSchema> = async (data) => {
    try {
      const res = await confirm2FA(data);
      setSession(res);
      navigateToNextPath();
    } catch (error) {
      const errors = getErrorMessage(error);
      if (errors) {
        toast.error(errors);
        return;
      }

      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <BaseAuthForm
      title="Two Factor Authentication"
      description={description}
      formSubmit={handleSubmit(onSubmit)}
      type="2fa"
    >
      <Meta title="Two Factor Authentication" />
      <div className="flex flex-col gap-2">
        <div className="flex w-full items-center justify-center">
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <CodeInput
                {...field}
                aria-label={description}
                codeLength={type === "totp" ? 6 : 8}
                pattern={REGEXP_ONLY_DIGITS}
                autoFocus
                onComplete={() => {
                  handleSubmit(onSubmit)();
                }}
              />
            )}
          />
        </div>
        {errors.code ? (
          <p className="text-destructive text-sm">{errors.code.message}</p>
        ) : null}
      </div>
      <Button
        type="submit"
        className="mt-2 w-full"
        size="sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? <Loader className="animate-spin" /> : "Sign In"}
      </Button>
      <div className="flex items-center justify-center">
        <Link to="/auth/2fa" size="sm">
          Use another method
        </Link>
      </div>
    </BaseAuthForm>
  );
}
