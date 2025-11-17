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
import { type SignInSchema, signIn, signInSchema } from "@/http/auth/sign-in";
import { HTTPError } from "@/http/client";

export default function SignInPage() {
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const { refetchSession, isAuthenticated } = useSession();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signInSchema),
  });

  const nextPathParam = searchParams.get("next") ?? "/";
  const nextPath = nextPathParam.startsWith("/") ? nextPathParam : "/";

  const onSubmit: SubmitHandler<SignInSchema> = async (data) => {
    try {
      await signIn(data);
    } catch (error) {
      if (error instanceof HTTPError) {
        console.error(error.data);
        setApiErrors(error.data?.errors?.map((e: any) => e.message) || []);
      }

      console.error(error);
      return;
    }

    refetchSession();
    if (nextPath.startsWith("/admin/")) {
      location.assign(nextPath);
    } else {
      navigate(nextPath);
    }
  };

  if (isAuthenticated) return null;

  return (
    <BasePageForSignIn
      title="Sign in"
      description="Welcome back! Please sign in to continue"
      formSubmit={handleSubmit(onSubmit)}
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
          placeholder="Type your password"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-destructive text-sm">{errors.password.message}</p>
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
        {isSubmitting ? <Loader className="animate-spin" /> : "Sign In"}
      </Button>
    </BasePageForSignIn>
  );
}
