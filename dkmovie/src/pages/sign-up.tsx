import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { BasePageForSignIn } from "@/components/pages/sign-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useSession } from "@/hooks/use-session";
import { type SignUpSchema, signUp, signUpSchema } from "@/http/auth/sign-up";
import { HTTPError } from "@/http/client";

export default function SignUpPage() {
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const { refetchSession, isAuthenticated } = useSession();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signUpSchema),
  });

  const nextPathParam = searchParams.get("next") ?? "/";
  const nextPath = nextPathParam.startsWith("/") ? nextPathParam : "/";

  const onSubmit: SubmitHandler<SignUpSchema> = async (data) => {
    try {
      await signUp(data);
    } catch (error) {
      if (error instanceof HTTPError) {
        const needEmailVerification = error.data?.data.flows.some(
          (flow: { id: string; is_pending: boolean }) => {
            return flow.id === "verify_email" && flow.is_pending;
          },
        );
        if (needEmailVerification) {
          navigate("/account/verify-email");
          return;
        }

        console.error(error.data);
        setApiErrors(error.data?.errors?.map((e: any) => e.message) || []);
      }

      console.error(error);
      return;
    }

    refetchSession();
    navigate(nextPath);
  };

  if (isAuthenticated) return null;

  return (
    <BasePageForSignIn
      title="Create your account"
      description="Welcome! Please fill in the details to get started."
      formSubmit={handleSubmit(onSubmit)}
      isSignIn={false}
    >
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
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p className="text-destructive text-sm">
            {errors.confirmPassword.message}
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
        {isSubmitting ? <Loader className="animate-spin" /> : "Sign Up"}
      </Button>
    </BasePageForSignIn>
  );
}
