import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { BaseAuthForm } from "@/components/base-auth-form";
import { Meta } from "@/components/meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-session";
import {
  type ForgotPasswordSchema,
  forgotPassword,
  forgotPasswordSchema,
} from "@/http/auth/password";
import { HTTPError } from "@/http/client";

export default function ForgotPasswordPage() {
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const { isAuthenticated } = useSession();
  const [searchParams] = useSearchParams();

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
      toast.success("Password reset email sent.", {
        description: "Please check your inbox for further instructions.",
      });
    } catch (error) {
      if (error instanceof HTTPError) {
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
      title="Forgot Password?"
      description="Enter your email to reset your password."
      formSubmit={handleSubmit(onSubmit)}
      type="forgot-password"
      isAuthenticated={isAuthenticated}
    >
      <Meta title="Forgot Password" />
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
