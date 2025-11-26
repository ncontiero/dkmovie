import { type SubmitHandler, Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { BaseAuthForm } from "@/components/base-auth-form";
import { Meta } from "@/components/meta";
import { ResendEmailCodeButton } from "@/components/resend-email-code-button";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/input-otp";
import { useNextPath } from "@/hooks/use-next-path";
import { useSession } from "@/hooks/use-session";
import { verifyEmail } from "@/http/auth/verify-email";
import { HTTPError } from "@/http/client";
import {
  type VerifyEmailSchema,
  verifyEmailSchema,
} from "@/schemas/auth/verify-email";
import { getErrorMessage } from "@/utils/errors";

export default function VerifyEmail() {
  const queryClient = useQueryClient();
  const { setSession } = useSession();
  const navigate = useNavigate();
  const { navigateToNextPath } = useNextPath();

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      key: "",
    },
  });

  const onSubmit: SubmitHandler<VerifyEmailSchema> = async (data) => {
    try {
      const res = await verifyEmail(data);
      setSession(res);
      queryClient.invalidateQueries({ queryKey: ["user-emails"] });
      toast.success("Email verified successfully.");
      navigateToNextPath();
    } catch (error) {
      if (error instanceof HTTPError) {
        if (error.status === 409) {
          toast.error("You don't have email to verify.");
          navigate("/account");
          return;
        }

        const errors = getErrorMessage(error);
        if (errors) toast.error(errors);
        return;
      }

      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <BaseAuthForm
      title="Verify your email"
      description="Please verify your email address to continue."
      formSubmit={handleSubmit(onSubmit)}
      type="verify-email"
    >
      <Meta title="Verify your email" />
      <div className="flex items-center justify-center">
        <Controller
          name="key"
          control={control}
          render={({ field }) => (
            <CodeInput
              {...field}
              aria-label="Enter your verification code"
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              autoFocus
              onComplete={() => {
                handleSubmit(onSubmit)();
              }}
            />
          )}
        />
        {errors.key ? (
          <p className="text-destructive text-sm">{errors.key.message}</p>
        ) : null}
      </div>
      <div className="-mt-4 flex items-center justify-center">
        <ResendEmailCodeButton
          variant="link"
          text="Didn't receive a code? Resend"
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        size="sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? <Loader className="animate-spin" /> : "Verify Email"}
      </Button>
    </BaseAuthForm>
  );
}
