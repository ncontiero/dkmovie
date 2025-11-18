import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";

import { PasswordCard } from "./password-card";

export function SecurityTabsContent() {
  return (
    <TabsContent value="security" className="w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Security</h2>
        <p className="text-foreground/80">
          Manage your password and authentication settings.
        </p>
      </div>
      <Separator className="mt-5 mb-7" />
      <PasswordCard />
    </TabsContent>
  );
}
