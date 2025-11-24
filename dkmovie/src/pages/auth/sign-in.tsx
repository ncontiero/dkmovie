import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { BaseAuthForm } from "@/components/base-auth-form";
import { Meta } from "@/components/meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/components/ui/link";
import { PasswordInput } from "@/components/ui/password-input";
import { useNextPath } from "@/hooks/use-next-path";
import { useSession } from "@/hooks/use-session";
import { signIn } from "@/http/auth/sign-in";
import { type SignInSchema, signInSchema } from "@/schemas/auth/sign-in";
import { needEmailVerification } from "@/utils/auth-flows";
import { getErrorMessage } from "@/utils/errors";

export default function SignInPage() {
  const { setSession, isAuthenticated, initialize2FAIfNecessary } =
    useSession();
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
        toast.success("You need to verify your email address.", {
          description: "Please check your email to verify your account.",
        });
        navigate(`/account/verify-email?next=${nextPath}`);
        return;
      }
      initialize2FAIfNecessary(error, nextPath);

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
      title="Sign in"
      description="Welcome back! Please sign in to continue"
      formSubmit={handleSubmit(onSubmit)}
    >
      <Meta title="Sign in" />
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
          <Label htmlFor="password">Password</Label>
          <Link to="/auth/password/forgot" size="sm">
            Forgot your password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          placeholder="Type your password"
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
        disabled={isSubmitting}
      >
        {isSubmitting ? <Loader className="animate-spin" /> : "Sign In"}
      </Button>
    </BaseAuthForm>
  );
}
