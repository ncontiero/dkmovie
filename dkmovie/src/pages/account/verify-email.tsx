import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { BaseAuthForm } from "@/components/base-auth-form";
import { Meta } from "@/components/meta";
import { ResendEmailCodeButton } from "@/components/resend-email-code-button";
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
  const { setSession } = useSession();
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const nextPathParam = searchParams.get("next") ?? "/account";
  const nextPath = nextPathParam.startsWith("/") ? nextPathParam : "/account";

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
      setSession(res);
      queryClient.invalidateQueries({ queryKey: ["user-emails"] });
      toast.success("Email verified successfully.");
      navigate(nextPath);
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
      <div className="flex flex-col gap-2">
        <Label htmlFor="code">Code</Label>
        <Input
          type="text"
          id="code"
          placeholder="Enter code here"
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
      <div className="flex items-center justify-center">
        <ResendEmailCodeButton />
      </div>
    </BaseAuthForm>
  );
}
