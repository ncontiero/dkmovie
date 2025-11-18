import { Meta } from "@/components/meta";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import { DeleteAccountCard } from "./delete-account-card";
import { UserEmailCard } from "./email-card";
import { FullNameCard } from "./full-name-card";

export function AccountTabsContent({ userId }: { readonly userId: number }) {
  return (
    <TabsContent value="account" className="w-full">
      <Meta title="My Account" />
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">My Account</h2>
        <p className="text-foreground/80">Manage your account settings.</p>
      </div>
      <Separator className="mt-5 mb-7" />
      <FullNameCard />
      <UserEmailCard userId={userId} />
      <DeleteAccountCard />
    </TabsContent>
  );
}
