import { ShieldAlert, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/hooks/use-session";
import { AccountTabsContent } from "./account-tabs";

export default function MyAccountPage() {
  const { session } = useSession();
  if (!session || !session.user) return null;

  return (
    <div className="text-foreground container mx-auto mt-30 flex min-h-screen max-w-7xl">
      <main className="w-full">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Account Management</h1>
          <p className="text-muted-foreground text-lg font-medium">
            Update your profile and manage your account settings.
          </p>
        </div>
        <Separator className="my-6 h-0.5" />
        <Tabs
          defaultValue="account"
          className="flex flex-col gap-6 md:flex-row"
          orientation="vertical"
        >
          <div className="flex overflow-hidden sm:overflow-visible md:w-1/5">
            <TabsList className="overflow-x-scroll md:overflow-x-auto">
              <TabsTrigger value="account">
                <User />
                Account
              </TabsTrigger>
              <TabsTrigger value="security">
                <ShieldAlert />
                Security
              </TabsTrigger>
            </TabsList>
          </div>
          <AccountTabsContent />
          <TabsContent value="security" className="w-full">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold">Security</h2>
              <p className="text-foreground/80">
                Manage your password and authentication settings.
              </p>
            </div>
            <Separator className="mt-5 mb-7" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
