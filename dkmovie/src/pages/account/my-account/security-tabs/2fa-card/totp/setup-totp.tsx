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
import {
  type ConfirmTOTPSchema,
  confirmTOTP,
  confirmTOTPSchema,
  setUpTOTP,
} from "@/http/account/2fa";
import { HTTPError } from "@/http/client";
import { needReAuthentication } from "@/utils/auth-flows";

export function SetupTOTP() {
  const queryClient = useQueryClient();
  const { session, initializeReAuthentication, isReAuthenticating } =
    useSession();
  const [showSetupTOTPDialog, setShowSetupTOTPDialog] = useState(false);
  const [isToGetRecoveryCodes, setIsToGetRecoveryCodes] = useState(false);

  const userId = session?.user.id;
  const otpFields = Array.from({ length: 6 });

  const { data: totp, isLoading: isSettingUpTOTP } = useQuery({
    queryKey: ["setup-totp", userId],
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
      await confirmTOTP(data);
      queryClient.invalidateQueries({ queryKey: ["setup-totp", userId] });
      queryClient.invalidateQueries({ queryKey: ["recovery-codes", userId] });
      toast.success("Setup TOTP successfully");
      setIsToGetRecoveryCodes(true);
    } catch (error) {
      if (error instanceof HTTPError) {
        if (error.status === 400) {
          toast.error(error.data?.errors.map((e: any) => e.message).join(", "));
          return;
        }

        if (needReAuthentication(error)) {
          initializeReAuthentication(() => handleSubmit(onSubmit)());
          return;
        }
      }

      console.error(error);
      toast.error("Something went wrong");
    }
  };

  if (isReAuthenticating) return null;

  return isToGetRecoveryCodes && userId ? (
    <RecoveryCodesDialog userId={userId} />
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
