import { Link } from "react-router";
import { RectangleEllipsis, Smartphone } from "lucide-react";
import { Meta } from "@/components/meta";
import { PasskeyAuthButton } from "@/components/passkey-auth-button";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";

export default function MultiFactorAuthenticationPage() {
  const { isAuthenticated, sessionMFATypes } = useSession();

  if (isAuthenticated) {
    return null;
  }

  const hasWebAuthn = sessionMFATypes.includes("webauthn");
  const hasTOTP = sessionMFATypes.includes("totp");
  const hasRecoveryCodes = sessionMFATypes.includes("recovery_codes");

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Meta title="Two Factor Authentication" />
      <div className="w-full max-w-md rounded-lg border shadow-lg">
        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-semibold">Two Factor Authentication</h1>
            <p className="text-muted-foreground text-sm font-medium">
              Your account is protected by two-factor authentication.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            {hasWebAuthn ? <PasskeyAuthButton className="w-full" /> : null}
            {hasTOTP ? (
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/auth/2fa/totp">
                  <Smartphone />
                  Continue with TOTP
                </Link>
              </Button>
            ) : null}
            {hasRecoveryCodes ? (
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/auth/2fa/recovery-codes">
                  <RectangleEllipsis />
                  Continue with Recovery Codes
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
