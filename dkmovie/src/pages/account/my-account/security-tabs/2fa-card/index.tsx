import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/card";
import { Badge } from "@/components/ui/badge";

import { useSession } from "@/hooks/use-session";
import {
  type Get2FAAuthenticatorWebAuthn,
  get2FAAuthenticators,
} from "@/http/account/2fa";
import { AddPasskey } from "./passkey/add-passkey";
import { PasskeysList } from "./passkey/passkeys-list";
import { RemoveTOTP } from "./totp/remove-totp";
import { SetupTOTP } from "./totp/setup-totp";
import { ViewRecoveryCodes } from "./view-recovery-codes";

export function TwoFactorAuthenticationCard() {
  const { session } = useSession();

  const { data: authenticators } = useQuery({
    queryKey: ["2fa", session?.user.id],
    queryFn: async () => await get2FAAuthenticators(),
    select: ({ data }) => data,
    staleTime: 1000 * 60 * 60,
    enabled: !!session?.user?.id,
  });

  if (!session?.user) return null;

  const hasTOTP = authenticators?.some((a) => a.type === "totp") || false;
  const hasPasskeys =
    authenticators?.some((a) => a.type === "webauthn") || false;
  const hasRecoveryCodes =
    authenticators?.some((a) => a.type === "recovery_codes") || false;

  const webauthnAuthenticators = authenticators?.filter(
    (a) => a.type === "webauthn",
  ) as Get2FAAuthenticatorWebAuthn[];

  return (
    <Card className="mt-10">
      <CardContent>
        <CardTitle>
          Two-Factor Authentication
          {hasTOTP || hasPasskeys ? (
            <Badge variant="defaultOutline" className="ml-2">
              Active
            </Badge>
          ) : (
            <Badge variant="destructiveOutline" className="ml-2">
              Inactive
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account by enabling two-factor
          authentication.
        </CardDescription>
        <div className="mt-4">
          <div className="flex flex-col">
            <div className="flex items-center justify-between rounded-t-lg border p-4">
              <div>
                <h4 className="font-semibold">Authenticator App (TOTP)</h4>
                <p className="text-muted-foreground text-sm">
                  Generate codes using an app like Google Authenticator or Okta
                  Verify.
                </p>
              </div>
              {hasTOTP ? <RemoveTOTP /> : <SetupTOTP />}
            </div>
            <div className="rounded-b-lg border-x border-b p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Passkeys</h4>
                  <p className="text-muted-foreground text-sm">
                    Use a passkey to sign in to your account. Passkeys are
                    secure, fast, and easy to use.
                  </p>
                </div>
                <AddPasskey />
              </div>
              {webauthnAuthenticators ? (
                <div>
                  <PasskeysList passkeys={webauthnAuthenticators} />
                </div>
              ) : null}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg border p-4">
            <div>
              <h4 className="font-semibold">Recovery Codes</h4>
              <p className="text-muted-foreground text-sm">
                Use recovery codes to recover your account if you lose access to
                your device.
              </p>
            </div>
            {hasRecoveryCodes ? <ViewRecoveryCodes /> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
