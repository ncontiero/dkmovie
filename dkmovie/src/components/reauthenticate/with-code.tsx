import type { ReAuthenticationProps } from "@/context/reauthenticate/context";
import { type SubmitHandler, Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { useSchemaTranslations } from "@/hooks/use-schema-translations";
import { useSession } from "@/hooks/use-session";
import { confirmReAuthCode, resendReAuthCode } from "@/http/auth/re-auth";
import {
  type ReAuthCodeSchema,
  reAuthCodeSchema,
} from "@/schemas/auth/re-auth";
import {
  getErrorMessage,
  isHttpConflict,
  isHttpForbidden,
  isHttpTooManyRequests,
} from "@/utils/errors";
import { Button } from "../ui/button";
import { DialogFooter } from "../ui/dialog";
import { CodeInput } from "../ui/input-otp";
import { Label } from "../ui/label";

interface ReAuthenticateWithCodeProps extends ReAuthenticationProps {
  readonly email: string;
  readonly onExpired: () => void;
}

export function ReAuthenticateWithCode({
  email,
  onReAuthenticated,
  onCancel,
  onExpired,
}: ReAuthenticateWithCodeProps) {
  const t = useTranslations("auth");
  const commonT = useTranslations("common");
  const { setSession } = useSession();

  const { schemaTranslator } = useSchemaTranslations({
    defaultError: commonT("errors.codeIsRequired"),
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reAuthCodeSchema, { error: schemaTranslator }),
    defaultValues: {
      code: "",
    },
  });

  const { mutate: resendCodeMutation, isPending: isResendingCode } =
    useMutation({
      mutationFn: resendReAuthCode,
      onSuccess: () => {
        toast.success(t("reAuth.codeSent", { email }));
      },
      onError: (error) => {
        if (isHttpForbidden(error) || isHttpTooManyRequests(error)) {
          toast.error(t("emailVerification.resend.tooManyRequests"));
          return;
        }

        if (isHttpConflict(error)) {
          toast.error(t("reAuth.codeExpired"));
          onExpired();
          return;
        }

        const errorMessage = getErrorMessage(error);
        if (errorMessage) {
          toast.error(errorMessage);
          return;
        }

        console.error(error);
        toast.error(commonT("errors.unexpected"));
      },
    });

  const onSubmit: SubmitHandler<ReAuthCodeSchema> = async (data) => {
    try {
      const res = await confirmReAuthCode(data);
      setSession(res);
      toast.success(t("reAuth.reAuthenticated"));
      onReAuthenticated();
    } catch (error) {
      if (isHttpConflict(error)) {
        toast.error(t("reAuth.codeExpired"));
        onExpired();
        return;
      }

      const errorMessage = getErrorMessage(error);
      if (errorMessage) {
        toast.error(errorMessage);
        return;
      }

      console.error(error);
      toast.error(commonT("errors.unexpected"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2">
        <Label htmlFor="reauth-email-code" className="my-2 text-center">
          {t("reAuth.codeDescription", { email })}
        </Label>
        <div className="flex w-full items-center justify-center">
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <CodeInput
                {...field}
                id="reauth-email-code"
                aria-label={t("reAuth.codeDescription", { email })}
                codeLength={8}
                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
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
        <Button
          type="button"
          variant="link"
          size="sm"
          loading={isResendingCode}
          onClick={() => {
            resendCodeMutation();
          }}
        >
          {t("reAuth.resendCode")}
        </Button>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting || isResendingCode}
          onClick={onCancel}
        >
          {commonT("actions.cancel")}
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={isResendingCode}>
          {t("reAuth.submit")}
        </Button>
      </DialogFooter>
    </form>
  );
}
