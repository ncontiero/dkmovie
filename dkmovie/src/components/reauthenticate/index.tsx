import type { ReAuthenticationProps } from "@/context/reauthenticate/context";
import type { TwoFactorAuthenticatorType } from "@/http/account/2fa";
import { useState } from "react";
import { LockKeyhole, RectangleEllipsis, Smartphone } from "lucide-react";
import { useTranslations } from "use-intl";
import { useFetchAuthenticators } from "@/hooks/fetch/use-fetch-authenticators";
import { useSession } from "@/hooks/use-session";
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
import { ReAuthenticateWithPassword } from "./with-password";

type ReAuthWith = null | "password" | TwoFactorAuthenticatorType;

export function ReAuthenticateDialog(props: ReAuthenticationProps) {
  const t = useTranslations("auth");
  const actionsT = useTranslations("common.actions");
  const { session } = useSession();
  const [reAuthWith, setReAuthWith] = useState<ReAuthWith>(null);

  const { data: authenticators } = useFetchAuthenticators();

  function have(type: TwoFactorAuthenticatorType) {
    return (
      authenticators?.some((authenticator) => authenticator.type === type) ||
      false
    );
  }

  const havePassword = session?.user.has_usable_password || false;
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
            <Button type="button" variant="outline" onClick={props.onCancel}>
              {actionsT("cancel")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
