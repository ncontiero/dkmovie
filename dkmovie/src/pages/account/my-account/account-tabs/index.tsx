import { useTranslations } from "use-intl";
import { Meta } from "@/components/meta";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import { DeleteAccountCard } from "./delete-account-card";
import { UserEmailCard } from "./email-card";
import { FullNameCard } from "./full-name-card";

export function AccountTabsContent() {
  const t = useTranslations("accountPage.tabs.account");

  return (
    <TabsContent value="/account" className="w-full">
      <Meta title={t("title")} />
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">{t("title")}</h2>
        <p className="text-foreground/80">{t("description")}</p>
      </div>
      <Separator className="mt-5 mb-7" />
      <FullNameCard />
      <UserEmailCard />
      <DeleteAccountCard />
    </TabsContent>
  );
}
