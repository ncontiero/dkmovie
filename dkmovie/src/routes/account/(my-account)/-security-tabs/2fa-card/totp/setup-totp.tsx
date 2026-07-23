import { useState } from "react";
import { type SubmitHandler, Controller, useForm } from "react-hook-form";
import QRCode from "react-qr-code";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
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
import { CodeInput } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { useReAuthenticate } from "@/hooks/use-reauthenticate";
import { useSchemaTranslations } from "@/hooks/use-schema-translations";
import { confirmTOTP, setUpTOTP } from "@/http/account/2fa";
import {
  type ConfirmTOTPSchema,
  confirmTOTPSchema,
} from "@/schemas/account/2fa";
import { needReAuthentication } from "@/utils/auth-flows";
import { getErrorMessage } from "@/utils/errors";

export function SetupTOTP() {
  const t = useTranslations("securityPage.2fa.appAuthenticator");
  const commonT = useTranslations("common");
  const queryClient = useQueryClient();
  const { initializeReAuthentication, isReAuthenticating } =
    useReAuthenticate();
  const [showSetupTOTPDialog, setShowSetupTOTPDialog] = useState(false);
  const [isToGetRecoveryCodes, setIsToGetRecoveryCodes] = useState(false);

  const { schemaTranslator } = useSchemaTranslations({
    defaultError: commonT("errors.codeIsRequired"),
  });

  const { data: totp, isLoading: isSettingUpTOTP } = useQuery({
    queryKey: ["setup-totp"],
    queryFn: setUpTOTP,
    staleTime: 1000 * 60 * 10,
    enabled: showSetupTOTPDialog,
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting: isConfirmingTOTP },
  } = useForm({
    resolver: zodResolver(confirmTOTPSchema, { error: schemaTranslator }),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit: SubmitHandler<ConfirmTOTPSchema> = async (data) => {
    try {
      const res = await confirmTOTP(data);
      toast.success(t("totpSetupSuccessfully"));
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
        initializeReAuthentication({
          onReAuthenticated: () => handleSubmit(onSubmit)(),
          onCancel: () => setShowSetupTOTPDialog(false),
        });
        return;
      }

      console.error(error);
      toast.error(commonT("errors.unexpected"));
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
          {commonT("actions.add")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("setupTOTP")}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>
        {isSettingUpTOTP ? (
          <div className="flex h-72 w-full flex-col items-center justify-center gap-4 rounded-lg border p-4 pb-6">
            <Spinner className="size-6" />
          </div>
        ) : totp?.totp_url ? (
          <div className="flex w-full flex-col items-center justify-center gap-4 rounded-lg border p-4 pb-6">
            <div className="flex items-center gap-2">
              <p>{totp.secret}</p>
              <CopyButton
                value={totp.secret}
                aria-label={t("copySecret")}
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
                <CodeInput
                  {...field}
                  aria-label={t("enter6Digits")}
                  pattern={REGEXP_ONLY_DIGITS}
                  autoFocus
                  onComplete={() => {
                    handleSubmit(onSubmit)();
                  }}
                />
              )}
            />
          </div>
          {errors.code ? (
            <p className="text-sm text-destructive">{errors.code.message}</p>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {commonT("actions.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" loading={isConfirmingTOTP}>
              {commonT("actions.confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
