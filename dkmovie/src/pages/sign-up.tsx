import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { z } from "zod";
import { BasePageForSignIn } from "@/components/pages/sign-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const signUpSchema = z.object({
  name: z
    .string()
    .min(4, { message: "The name must have at least 4 characters." }),
  email: z.email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "The password must be at least 8 characters long." }),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
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

  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    console.log("Simulating API call...");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Form data submitted:", data);

    navigate(nextPath);
  };

  return (
    <BasePageForSignIn
      title="Create your account"
      description="Welcome! Please fill in the details to get started."
      formSubmit={handleSubmit(onSubmit)}
      isSignIn={false}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          placeholder="Your full name"
          {...register("name")}
        />
        {errors.name ? (
          <p className="text-destructive text-sm">{errors.name.message}</p>
        ) : null}
      </div>
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
          placeholder="At least 8 characters"
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
        {isSubmitting ? <Loader className="animate-spin" /> : "Sign Up"}
      </Button>
    </BasePageForSignIn>
  );
}
