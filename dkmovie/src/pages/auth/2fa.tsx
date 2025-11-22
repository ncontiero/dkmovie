import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
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
  type TwoFactorAuthSchema,
  confirm2FA,
  twoFactorAuthSchema,
} from "@/http/auth/2fa";
import { HTTPError } from "@/http/client";

const especialNextPaths = [
  `/${process.env.DJANGO_ADMIN_URL || "admin/"}`,
  "/api/docs",
];

export default function TwoFactorAuthenticationPage() {
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const { setSession, isAuthenticated } = useSession();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(twoFactorAuthSchema),
  });

  if (isAuthenticated) return null;

  const nextPathParam = searchParams.get("next") ?? "/";
  const nextPath = nextPathParam.startsWith("/") ? nextPathParam : "/";

  const onSubmit: SubmitHandler<TwoFactorAuthSchema> = async (data) => {
    try {
      const res = await confirm2FA(data);
      setSession(res);

      if (especialNextPaths.includes(nextPath)) {
        location.assign(nextPath);
      } else {
        navigate(nextPath);
      }
    } catch (error) {
      if (error instanceof HTTPError) {
        setApiErrors(error.data?.errors?.map((e: any) => e.message) || []);
        return;
      }

      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <BaseAuthForm
      title="Two Factor Authentication"
      description="Please enter the code from your authenticator app"
      formSubmit={handleSubmit(onSubmit)}
      type="2fa"
    >
      <Meta title="Two Factor Authentication" />
      <div className="flex flex-col gap-2">
        <Label htmlFor="code">Code</Label>
        <Input type="text" id="code" {...register("code")} />
        {errors.code ? (
          <p className="text-destructive text-sm">{errors.code.message}</p>
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
    </BaseAuthForm>
  );
}
