import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { z } from "zod";
import { BasePageForSignIn } from "@/components/pages/sign-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const signInSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
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

  const onSubmit: SubmitHandler<SignInFormData> = async (data) => {
    console.log("Simulating API call...");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Form data submitted:", data);

    navigate(nextPath);
  };

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
        <Input
          type="password"
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
    </BasePageForSignIn>
  );
}
