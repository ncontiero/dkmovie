import type { Get2FAAuthenticatorWebAuthn } from "@/http/account/2fa";
import { useTranslations } from "use-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/card";
import { Badge } from "@/components/ui/badge";
import { useFetchAuthenticators } from "@/hooks/fetch/use-fetch-authenticators";
import { AddPasskey } from "./passkey/add-passkey";
import { PasskeysList } from "./passkey/passkeys-list";
import { RemoveTOTP } from "./totp/remove-totp";
import { SetupTOTP } from "./totp/setup-totp";
import { ViewRecoveryCodes } from "./view-recovery-codes";

export function TwoFactorAuthenticationCard() {
  const t = useTranslations("securityPage.2fa");
  const { data: authenticators } = useFetchAuthenticators();

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
          {t("title")}
          {hasTOTP || hasPasskeys ? (
            <Badge variant="defaultOutline" className="ml-2">
              {t("active")}
            </Badge>
          ) : (
            <Badge variant="destructiveOutline" className="ml-2">
              {t("inactive")}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
        <div className="mt-4">
          <div className="flex flex-col">
            <div className="flex items-center justify-between rounded-t-lg border p-4">
              <div>
                <h4 className="font-semibold">{t("appAuthenticator.title")}</h4>
                <p className="text-muted-foreground text-sm">
                  {t("appAuthenticator.description")}
                </p>
              </div>
              {hasTOTP ? <RemoveTOTP /> : <SetupTOTP />}
            </div>
            <div className="rounded-b-lg border-x border-b p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{t("passkey.title")}</h4>
                  <p className="text-muted-foreground text-sm">
                    {t("passkey.description")}
                  </p>
                </div>
                <AddPasskey />
              </div>
              {webauthnAuthenticators && webauthnAuthenticators.length > 0 ? (
                <div>
                  <PasskeysList passkeys={webauthnAuthenticators} />
                </div>
              ) : null}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg border p-4">
            <div>
              <h4 className="font-semibold">{t("recoveryCodes.title")}</h4>
              <p className="text-muted-foreground text-sm">
                {t("recoveryCodes.description")}
              </p>
            </div>
            {hasRecoveryCodes ? <ViewRecoveryCodes /> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
