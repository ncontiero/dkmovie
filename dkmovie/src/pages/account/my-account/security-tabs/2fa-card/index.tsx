import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/card";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { get2FAAuthenticators } from "@/http/account/2fa";
import { GenerateCodes } from "./totp/generate-codes";
import { RemoveTOTP } from "./totp/remove-totp";
import { SetupTOTP } from "./totp/setup-totp";

export function TwoFactorAuthenticationCard() {
  const { session } = useSession();

  const { data: authenticators } = useQuery({
    queryKey: ["2fa", session?.user.id],
    queryFn: async () => await get2FAAuthenticators(),
    select: ({ data }) => data,
    staleTime: 1000 * 60 * 10,
    enabled: !!session?.user?.id,
  });

  if (!session?.user) return null;

  const hasTOTP = authenticators?.some((a) => a.type === "totp") || false;
  const hasPasskeys =
    authenticators?.some((a) => a.type === "webauthn") || false;
  const hasRecoveryCodes =
    authenticators?.some((a) => a.type === "recovery_codes") || false;

  return (
    <Card className="mt-10">
      <CardContent>
        <CardTitle>Two-Factor Authentication</CardTitle>
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
            <div className="flex items-center justify-between rounded-b-lg border-x border-b p-4">
              <div>
                <h4 className="font-semibold">Passkeys</h4>
                <p className="text-muted-foreground text-sm">
                  Use a passkey to sign in to your account. Passkeys are secure,
                  fast, and easy to use.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm">
                {hasPasskeys ? "Edit" : "Add"}
              </Button>
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
            <GenerateCodes alreadyExists={hasRecoveryCodes} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
