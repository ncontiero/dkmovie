import { createFileRoute, Link } from "@tanstack/react-router";
import { RectangleEllipsis, Smartphone } from "lucide-react";
import { useTranslations } from "use-intl";
import { PasskeyAuthButton } from "@/components/passkey-auth-button";
import { Button } from "@/components/ui/button";
import { useMFA } from "@/hooks/use-mfa";
import { useNextPath } from "@/hooks/use-next-path";

export const Route = createFileRoute("/auth/2fa/")({
  component: MFAComponent,
});

function MFAComponent() {
  const t = useTranslations("authWith2faPage");
  const { mFATypes } = useMFA();
  const { nextPath } = useNextPath();

  const hasWebAuthn = mFATypes.includes("webauthn");
  const hasTOTP = mFATypes.includes("totp");
  const hasRecoveryCodes = mFATypes.includes("recovery_codes");

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg border shadow-lg">
        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-semibold">{t("title")}</h1>
            <p className="text-sm font-medium text-muted-foreground">
              {t("description")}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            {hasWebAuthn ? <PasskeyAuthButton className="w-full" /> : null}
            {hasTOTP ? (
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/auth/2fa/totp" search={{ next: nextPath }}>
                  <Smartphone />
                  {t("continueWithTOTP")}
                </Link>
              </Button>
            ) : null}
            {hasRecoveryCodes ? (
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/auth/2fa/recovery-codes" search={{ next: nextPath }}>
                  <RectangleEllipsis />
                  {t("continueWithRecoveryCodes")}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
