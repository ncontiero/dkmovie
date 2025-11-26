import { Outlet, useLocation, useNavigate } from "react-router";
import { ShieldAlert, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReAuthenticateProvider } from "@/context/reauthenticate/provider";

export default function MyAccountLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <ReAuthenticateProvider>
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
            value={pathname}
            onValueChange={(value) => navigate(value)}
            className="flex flex-col gap-6 md:flex-row"
            orientation="vertical"
          >
            <div className="flex overflow-hidden sm:overflow-visible md:w-1/5">
              <TabsList className="overflow-x-scroll md:overflow-x-auto">
                <TabsTrigger value="/account">
                  <User />
                  Account
                </TabsTrigger>
                <TabsTrigger value="/account/security">
                  <ShieldAlert />
                  Security
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="w-full">
              <Outlet />
            </div>
          </Tabs>
        </main>
      </div>
    </ReAuthenticateProvider>
  );
}
