import { useTranslations } from "use-intl";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import { TwoFactorAuthenticationCard } from "./2fa-card";
import { ConnectedAccountsCard } from "./connected-accounts-card";
import { PasswordCard } from "./password-card";
import { SessionsCard } from "./sessions-card";

export function SecurityTabsContent() {
  const t = useTranslations("accountPage.tabs.security");

  return (
    <TabsContent value="/account/security" className="w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">{t("title")}</h2>
        <p className="text-foreground/80">{t("description")}</p>
      </div>
      <Separator className="mt-5 mb-7" />
      <PasswordCard />
      <ConnectedAccountsCard />
      <TwoFactorAuthenticationCard />
      <SessionsCard />
    </TabsContent>
  );
}
