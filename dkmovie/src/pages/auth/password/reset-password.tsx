import { useCallback, useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { BaseAuthForm } from "@/components/base-auth-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useSession } from "@/hooks/use-session";
import {
  type ResetPasswordSchema,
  resetPassword,
  resetPasswordSchema,
  verifyResetKey,
} from "@/http/auth/password";
import { HTTPError } from "@/http/client";

export default function ResetPasswordPage() {
  const { refetchSession } = useSession();
  const { key } = useParams();
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  const verifyKey = useCallback(async () => {
    if (!key) {
      toast.error("Invalid password reset link.", {
        description: "Please request a new password reset email.",
      });
      navigate("/auth/sign-in");
      return;
    }

    try {
      await verifyResetKey(key);
    } catch (error) {
      if (error instanceof HTTPError) {
        toast.error("Invalid password reset link.", {
          description: "Please request a new password reset email.",
        });
        navigate("/auth/sign-in");
        return;
      }
    }
  }, [key, navigate]);

  useEffect(() => {
    verifyKey();
  }, [verifyKey]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit: SubmitHandler<ResetPasswordSchema> = async (data) => {
    if (!key) return;
    try {
      await resetPassword(key, data);
    } catch (error) {
      if (error instanceof HTTPError) {
        if (error.status === 401) {
          refetchSession();
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
      description="Enter your new password."
      isSignIn={false}
      formSubmit={handleSubmit(onSubmit)}
    >
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
