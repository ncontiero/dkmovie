import type { ReAuthenticationProps } from "@/context/reauthenticate/context";
import type { TwoFactorAuthenticatorType } from "@/http/account/2fa";
import { useState } from "react";
import { LockKeyhole, RectangleEllipsis, Smartphone } from "lucide-react";
import { useFetchAuthenticators } from "@/hooks/fetch/use-fetch-authenticators";
import { useSession } from "@/hooks/use-session";
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
import { BaseAuthFormWithCode } from "./base-2fa-code";
import { ReAuthenticateWithPassword } from "./with-password";

type ReAuthWith = null | "password" | TwoFactorAuthenticatorType;

export function ReAuthenticateDialog(props: ReAuthenticationProps) {
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
      <DialogContent addClose={false}>
        <DialogHeader>
          <DialogTitle>Re-authenticate to continue</DialogTitle>
          <DialogDescription>
            You need to re-authenticate to perform this action.
          </DialogDescription>
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
              Continue with password
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
              Continue with Authenticator App
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
              Continue with Recovery Codes
            </Button>
          ) : null}
        </div>
        {reAuthWith === "password" ? (
          <ReAuthenticateWithPassword {...props} />
        ) : reAuthWith === "totp" ? (
          <BaseAuthFormWithCode type="totp" {...props} />
        ) : reAuthWith === "recovery_codes" ? (
          <BaseAuthFormWithCode type="recovery_codes" {...props} />
        ) : (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={props.onCancel}>
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
