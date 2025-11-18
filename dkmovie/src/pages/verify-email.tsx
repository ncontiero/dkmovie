import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { BaseAuthForm } from "@/components/base-auth-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-session";
import {
  type VerifyEmailSchema,
  verifyEmail,
  verifyEmailSchema,
} from "@/http/auth/verify-email";
import { HTTPError } from "@/http/client";

export default function VerifyEmail() {
  const queryClient = useQueryClient();
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const { refetchSession, isAuthenticated } = useSession();
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(verifyEmailSchema),
  });

  const onSubmit: SubmitHandler<VerifyEmailSchema> = async (data) => {
    try {
      const res = await verifyEmail(data);
      refetchSession(res);
      queryClient.invalidateQueries({ queryKey: ["user-emails"] });
      toast.success("Email verified successfully.");
      navigate("/account");
    } catch (error) {
      if (error instanceof HTTPError) {
        console.error(error.data);
        if (error.status === 409) {
          toast.error("Reached the maximum number of attempts");
          navigate("/account");
        }
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
      description="To continue, type your verification code below."
      formSubmit={handleSubmit(onSubmit)}
      isSignIn={false}
      isAuthenticated={isAuthenticated}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="code">Code</Label>
        <Input
          type="text"
          id="code"
          placeholder="type your code here"
          {...register("key")}
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
      <Button
        type="submit"
        className="mt-2 w-full"
        size="sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? <Loader className="animate-spin" /> : "Verify Email"}
      </Button>
    </BaseAuthForm>
  );
}
