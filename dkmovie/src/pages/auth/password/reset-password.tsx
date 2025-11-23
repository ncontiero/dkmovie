import { useState } from "react";
import { type SubmitHandler, Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { BaseAuthForm } from "@/components/base-auth-form";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useSession } from "@/hooks/use-session";
import {
  type ResetPasswordSchema,
  resetPassword,
  resetPasswordSchema,
} from "@/http/auth/password";
import { HTTPError } from "@/http/client";

export default function ResetPasswordPage() {
  const { setSession } = useSession();
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  const codesSlot = Array.from({ length: 8 });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      key: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit: SubmitHandler<ResetPasswordSchema> = async (data) => {
    try {
      await resetPassword(data);
    } catch (error) {
      if (error instanceof HTTPError) {
        if (error.status === 409) {
          toast.error(
            "Expired or invalid verification code. Request a new one.",
          );
          navigate("/auth/password/forgot");
          return;
        }
        if (error.status === 401) {
          setSession(null);
          toast.success("Password reset successful.", {
            description: "You can now sign in with your new password.",
          });
          navigate("/auth/sign-in");
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
      title="Reset Password"
      description="Enter the verification code sent to your email and create a new password."
      formSubmit={handleSubmit(onSubmit)}
      type="reset-password"
    >
      <div className="flex flex-col items-center gap-2">
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
        </div>
        {errors.key ? (
          <p className="text-destructive text-sm">{errors.key.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          placeholder="At least 8 characters"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-destructive text-sm">{errors.password.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <PasswordInput
          id="confirm-password"
          placeholder="At least 8 characters"
          {...register("passwordConfirmation")}
        />
        {errors.passwordConfirmation ? (
          <p className="text-destructive text-sm">
            {errors.passwordConfirmation.message}
          </p>
        ) : null}
      </div>
      {apiErrors.length > 0 ? (
        <ul className="text-destructive text-sm">
          {apiErrors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
      <Button
        type="submit"
        className="mt-2 w-full"
        size="sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? <Loader className="animate-spin" /> : "Reset Password"}
      </Button>
    </BaseAuthForm>
  );
}
