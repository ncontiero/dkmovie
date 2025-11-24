import { useState } from "react";
import { type SubmitHandler, Controller, useForm } from "react-hook-form";
import QRCode from "react-qr-code";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { RecoveryCodesDialog } from "@/components/recovery-codes/dialog";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useSession } from "@/hooks/use-session";
import { confirmTOTP, setUpTOTP } from "@/http/account/2fa";
import {
  type ConfirmTOTPSchema,
  confirmTOTPSchema,
} from "@/schemas/account/2fa";
import { needReAuthentication } from "@/utils/auth-flows";
import { getErrorMessage } from "@/utils/errors";

export function SetupTOTP() {
  const queryClient = useQueryClient();
  const { initializeReAuthentication, isReAuthenticating } = useSession();
  const [showSetupTOTPDialog, setShowSetupTOTPDialog] = useState(false);
  const [isToGetRecoveryCodes, setIsToGetRecoveryCodes] = useState(false);

  const otpFields = Array.from({ length: 6 });

  const { data: totp, isLoading: isSettingUpTOTP } = useQuery({
    queryKey: ["setup-totp"],
    queryFn: async () => await setUpTOTP(),
    staleTime: 1000 * 60 * 10,
    enabled: showSetupTOTPDialog,
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting: isConfirmingTOTP },
  } = useForm({
    resolver: zodResolver(confirmTOTPSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit: SubmitHandler<ConfirmTOTPSchema> = async (data) => {
    try {
      const res = await confirmTOTP(data);
      toast.success("Setup TOTP successfully");
      if (res?.meta?.recovery_codes_generated) {
        setIsToGetRecoveryCodes(true);
      } else {
        queryClient.invalidateQueries({ queryKey: ["2fa"] });
        setShowSetupTOTPDialog(false);
      }
      queryClient.invalidateQueries({ queryKey: ["setup-totp"] });
      queryClient.invalidateQueries({ queryKey: ["recovery-codes"] });
    } catch (error) {
      const errors = getErrorMessage(error);
      if (errors) {
        toast.error(errors);
        return;
      }

      if (needReAuthentication(error)) {
        initializeReAuthentication(() => handleSubmit(onSubmit)());
        return;
      }

      console.error(error);
      toast.error("Something went wrong");
    }
  };

  if (isReAuthenticating) return null;

  return isToGetRecoveryCodes ? (
    <RecoveryCodesDialog
      onOpenChange={(open) => {
        if (!open) {
          queryClient.invalidateQueries({ queryKey: ["2fa"] });
        }
        setIsToGetRecoveryCodes(open);
      }}
    />
  ) : (
    <Dialog open={showSetupTOTPDialog} onOpenChange={setShowSetupTOTPDialog}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Setup TOTP</DialogTitle>
          <DialogDescription>
            Scan the QR code below with your preferred authenticator app. Then,
            enter the 6 digit code that the app provides to continue. You can
            also copy the secret below and paste it into your app.
          </DialogDescription>
        </DialogHeader>
        {isSettingUpTOTP ? (
          <div className="flex h-72 w-full flex-col items-center justify-center gap-4 rounded-lg border p-4 pb-6">
            <Loader className="animate-spin" />
          </div>
        ) : totp?.totp_url ? (
          <div className="flex w-full flex-col items-center justify-center gap-4 rounded-lg border p-4 pb-6">
            <div className="flex items-center gap-2">
              <p>{totp.secret}</p>
              <CopyButton
                value={totp.secret}
                aria-label="Copy secret to clipboard"
                className="size-6"
                variant="ghost"
              />
            </div>
            <div className="flex justify-center rounded-lg bg-white p-4">
              <QRCode value={totp.totp_url} size={208} />
            </div>
          </div>
        ) : null}
        <form
          className="mt-3 flex w-full flex-col gap-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex w-full items-center justify-center">
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <InputOTP
                  {...field}
                  aria-label="Enter 6 digit code from your authenticator app"
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
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isConfirmingTOTP}>
              {isConfirmingTOTP ? (
                <Loader className="animate-spin" />
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
