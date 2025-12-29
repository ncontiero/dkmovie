import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { ShieldAlert, User } from "lucide-react";
import { useTranslations } from "use-intl";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReAuthenticateProvider } from "@/context/reauthenticate/provider";

export const Route = createFileRoute("/account/(my-account)")({
  component: MyAccountLayoutComponent,
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/auth/sign-in",
        search: { next: location.href },
      });
    }
  },
});

function MyAccountLayoutComponent() {
  const t = useTranslations("accountPage");
  const {
    djangoAdminUrl: adminUrl,
    auth: { user },
  } = Route.useRouteContext();
  const { pathname } = useLocation();
  const navigate = Route.useNavigate();

  return (
    <ReAuthenticateProvider>
      <div className="text-foreground container mx-auto mt-30 flex min-h-screen max-w-7xl">
        <main className="w-full">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground text-lg font-medium">
              {t("description")}
            </p>
            {user?.is_superuser ? (
              <a
                href={adminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  hover:text-primary ring-ring rounded-lg text-sm font-medium duration-200 hover:underline
                  focus-visible:ring-2 focus-visible:outline-hidden
                `}
              >
                {t("accessAdmin")}
              </a>
            ) : null}
          </div>
          <Separator className="my-6 h-0.5" />
          <Tabs
            value={pathname}
            onValueChange={(value) => navigate({ to: value })}
            className="flex flex-col gap-6 md:flex-row"
            orientation="vertical"
          >
            <div className="flex overflow-hidden sm:overflow-visible md:w-1/5">
              <TabsList className="overflow-x-scroll md:overflow-x-auto">
                <TabsTrigger value="/account">
                  <User />
                  {t("tabs.account.label")}
                </TabsTrigger>
                <TabsTrigger value="/account/security">
                  <ShieldAlert />
                  {t("tabs.security.label")}
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
