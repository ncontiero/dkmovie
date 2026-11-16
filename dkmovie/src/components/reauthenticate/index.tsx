import type { ReAuthenticationProps } from "@/context/reauthenticate/context";
import type { TwoFactorAuthenticatorType } from "@/http/account/2fa";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LockKeyhole, Mail, RectangleEllipsis, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { useFetchAuthenticators } from "@/hooks/fetch/use-fetch-authenticators";
import { useSession } from "@/hooks/use-session";
import { getUserEmails } from "@/http/account/emails";
import { requestReAuthCode } from "@/http/auth/re-auth";
import {
  getErrorMessage,
  isHttpForbidden,
  isHttpTooManyRequests,
} from "@/utils/errors";
import { AuthWithCode } from "../auth-with-code";
import { PasskeyAuthButton } from "../passkey-auth-button";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ReAuthenticateWithCode } from "./with-code";
import { ReAuthenticateWithPassword } from "./with-password";

type ReAuthWith = null | "password" | "code" | TwoFactorAuthenticatorType;

export function ReAuthenticateDialog(props: ReAuthenticationProps) {
  const t = useTranslations("auth");
  const commonT = useTranslations("common");
  const { session } = useSession();
  const [reAuthWith, setReAuthWith] = useState<ReAuthWith>(null);

  const { data: authenticators } = useFetchAuthenticators();
  const { data: userEmails } = useQuery({
    queryKey: ["user-emails"],
    queryFn: getUserEmails,
    staleTime: 1000 * 60 * 60,
  });

  function have(type: TwoFactorAuthenticatorType) {
    return (
      authenticators?.some((authenticator) => authenticator.type === type) ||
      false
    );
  }

  const verifiedEmail =
    userEmails?.find((email) => email.verified && email.primary)?.email ??
    userEmails?.find((email) => email.verified)?.email;

  const { mutate: requestEmailCodeMutation, isPending: isRequestingEmailCode } =
    useMutation({
      mutationFn: async (email: string) => {
        await requestReAuthCode({ email });
        return email;
      },
      onSuccess: (email) => {
        toast.success(t("reAuth.codeSent", { email }));
        setReAuthWith("code");
      },
      onError: (error) => {
        if (isHttpForbidden(error) || isHttpTooManyRequests(error)) {
          toast.error(t("emailVerification.resend.tooManyRequests"));
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

  const havePassword = session?.user.has_usable_password || false;
  const haveEmailCode = Boolean(verifiedEmail);
  const havePasskey = have("webauthn");
  const haveTOTP = have("totp");
  const haveRecoveryCodes = have("recovery_codes");

  return (
    <Dialog defaultOpen open>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t("reAuth.title")}</DialogTitle>
          <DialogDescription>{t("reAuth.description")}</DialogDescription>
        </DialogHeader>
        <div className="my-2 flex flex-col gap-2">
          {havePassword ? (
            <Button
              type="button"
              onClick={() => {
                setReAuthWith("password");
              }}
              variant="outline"
              size="sm"
              className={reAuthWith === "password" ? "bg-muted" : undefined}
            >
              <LockKeyhole />
              {t("continueWith.password")}
            </Button>
          ) : null}
          {haveEmailCode && verifiedEmail ? (
            <Button
              type="button"
              onClick={() => {
                if (reAuthWith === "code") return;
                requestEmailCodeMutation(verifiedEmail);
              }}
              loading={isRequestingEmailCode}
              variant="outline"
              size="sm"
              className={reAuthWith === "code" ? "bg-muted" : undefined}
            >
              <Mail />
              {t("continueWith.emailCode")}
            </Button>
          ) : null}
          {havePasskey ? (
            <PasskeyAuthButton
              flow="reauthenticate"
              isToNavigateToNextPath={false}
              onAuthenticated={props.onReAuthenticated}
            />
          ) : null}
          {haveTOTP ? (
            <Button
              type="button"
              onClick={() => {
                setReAuthWith("totp");
              }}
              variant="outline"
              size="sm"
              className={reAuthWith === "totp" ? "bg-muted" : undefined}
            >
              <Smartphone />
              {t("continueWith.totp")}
            </Button>
          ) : null}
          {haveRecoveryCodes ? (
            <Button
              type="button"
              onClick={() => {
                setReAuthWith("recovery_codes");
              }}
              variant="outline"
              size="sm"
              className={
                reAuthWith === "recovery_codes" ? "bg-muted" : undefined
              }
            >
              <RectangleEllipsis />
              {t("continueWith.recoveryCodes")}
            </Button>
          ) : null}
        </div>
        {reAuthWith === "password" ? (
          <ReAuthenticateWithPassword {...props} />
        ) : reAuthWith === "code" && verifiedEmail ? (
          <ReAuthenticateWithCode
            {...props}
            email={verifiedEmail}
            onExpired={() => {
              setReAuthWith(null);
            }}
          />
        ) : reAuthWith === "totp" ? (
          <AuthWithCode
            codeType="totp"
            type="reauthenticate"
            reAuthentication={props}
          />
        ) : reAuthWith === "recovery_codes" ? (
          <AuthWithCode
            codeType="recovery_codes"
            type="reauthenticate"
            reAuthentication={props}
          />
        ) : (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={props.onCancel}
              disabled={isRequestingEmailCode}
            >
              {commonT("actions.cancel")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
