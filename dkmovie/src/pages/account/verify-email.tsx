import { useState } from "react";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useNextPath } from "@/hooks/use-next-path";
import { useSession } from "@/hooks/use-session";
import { verifyEmail } from "@/http/auth/verify-email";
import { HTTPError } from "@/http/client";
import {
  type VerifyEmailSchema,
  verifyEmailSchema,
} from "@/schemas/auth/verify-email";

export default function VerifyEmail() {
  const queryClient = useQueryClient();
  const { setSession } = useSession();
  const [apiErrors, setApiErrors] = useState<string[]>([]);
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

  const codesSlot = Array.from({ length: 6 });

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
        console.error(error.data);
        setApiErrors(error.data?.errors?.map((e: any) => e.message) || []);
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
            <InputOTP
              {...field}
              aria-label="Enter your verification code"
              maxLength={codesSlot.length}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              autoFocus
              onComplete={() => {
                handleSubmit(onSubmit)();
              }}
            >
              <InputOTPGroup>
                {codesSlot.map((_, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          )}
        />
        {errors.key ? (
          <p className="text-destructive text-sm">{errors.key.message}</p>
        ) : null}
      </div>
      {apiErrors.length > 0 ? (
        <ul className="text-destructive text-sm">
          {apiErrors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
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
