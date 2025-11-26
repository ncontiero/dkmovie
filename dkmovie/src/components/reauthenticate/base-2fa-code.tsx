import type { ReAuthenticationProps } from "@/context/reauthenticate/context";
import { type SubmitHandler, Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useSession } from "@/hooks/use-session";
import { reAuth2FA } from "@/http/auth/re-auth";
import {
  type TwoFactorAuthSchema,
  twoFactorAuthSchema,
} from "@/schemas/auth/2fa";
import { getErrorMessage } from "@/utils/errors";
import { DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";

interface BaseAuthFormWithCodeProps extends ReAuthenticationProps {
  readonly type: "totp" | "recovery_codes";
}

export function BaseAuthFormWithCode({
  type,
  onReAuthenticated,
  onCancel,
}: BaseAuthFormWithCodeProps) {
  const { setSession } = useSession();

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(twoFactorAuthSchema),
    defaultValues: {
      code: "",
    },
  });

  const description =
    type === "totp"
      ? "Enter the code from your authenticator app"
      : "Enter one of your recovery codes";
  const otpFields = Array.from({ length: type === "totp" ? 6 : 8 });

  const onSubmit: SubmitHandler<TwoFactorAuthSchema> = async (data) => {
    try {
      const res = await reAuth2FA(data);
      setSession(res);
      toast.success("Re-authenticated successfully");
      onReAuthenticated();
    } catch (error) {
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Label htmlFor={`${type}-code`} className="my-2 justify-between">
        {description}
      </Label>
      <div className="flex w-full items-center justify-center">
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <InputOTP
              {...field}
              id={`${type}-code`}
              aria-label={
                type === "totp"
                  ? "Enter 6 digit code from your authenticator app"
                  : "Enter one of your recovery codes"
              }
              maxLength={otpFields.length}
              pattern={REGEXP_ONLY_DIGITS}
              autoFocus
              onComplete={(value) => {
                field.onChange(value);
                handleSubmit(onSubmit)();
              }}
            >
              <InputOTPGroup>
                {otpFields.map((_, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          )}
        />
      </div>
      {errors.code ? (
        <p className="text-destructive text-sm">{errors.code.message}</p>
      ) : null}
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader className="animate-spin" />
          ) : (
            "Re-authenticate"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
