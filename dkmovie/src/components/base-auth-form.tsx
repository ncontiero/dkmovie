import type { BaseSyntheticEvent, PropsWithChildren } from "react";
import { useTranslations } from "use-intl";
import { Link } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import { useFetchSocialAccounts } from "@/hooks/fetch/use-fetch-social-accounts";
import { useNextPath } from "@/hooks/use-next-path";
import { PasskeyAuthButton } from "./passkey-auth-button";
import { ProviderButton } from "./provider-button";
import { Spinner } from "./ui/spinner";

interface BaseAuthFormProps extends PropsWithChildren {
  readonly formSubmit?: (e?: BaseSyntheticEvent) => Promise<void>;
  readonly title: string;
  readonly description: string;
  readonly isAuthenticated?: boolean;
  readonly type?:
    | "sign-in"
    | "sign-up"
    | "verify-email"
    | "forgot-password"
    | "reset-password"
    | "2fa";
}

export function BaseAuthForm({
  children,
  formSubmit,
  title,
  description,
  isAuthenticated = false,
  type = "sign-in",
}: BaseAuthFormProps) {
  const t = useTranslations("auth");
  const { data: socialAccounts, isLoading: isSocialAccountsLoading } =
    useFetchSocialAccounts();

  const { nextPath } = useNextPath();
  const nextPathParam = nextPath ? `?next=${nextPath}` : "";

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg border shadow-lg">
        {isSocialAccountsLoading ? (
          <div className="flex h-[630px] items-center justify-center">
            <Spinner className="text-primary size-20" />
          </div>
        ) : (
          <>
            <div className="space-y-6 p-6 sm:p-8">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-xl font-semibold">{title}</h1>
                <p className="text-muted-foreground text-sm font-medium">
                  {description}
                </p>
              </div>
              {type === "sign-in" || type === "sign-up" ? (
                <>
                  <div className="flex flex-col items-center justify-center gap-2">
                    {socialAccounts?.map((provider) => (
                      <ProviderButton
                        key={provider.id}
                        className="w-full"
                        provider={provider.id}
                        text={t("continueWith.provider", {
                          provider: provider.name,
                        })}
                      />
                    ))}
                    {type === "sign-in" && (
                      <PasskeyAuthButton className="w-full" />
                    )}
                  </div>
                  <div className="text-muted-foreground flex items-center justify-center text-sm">
                    <Separator className="flex-1" />
                    <p className="mx-3">{t("continueWith.or")}</p>
                    <Separator className="flex-1" />
                  </div>
                </>
              ) : (
                <Separator />
              )}
              {formSubmit ? (
                <form onSubmit={formSubmit} className="space-y-6">
                  {children}
                </form>
              ) : (
                children
              )}
              {type === "forgot-password" && !isAuthenticated ? (
                <>
                  <div className="flex items-center justify-center">
                    <Separator className="flex-1" />
                    <p className="text-muted-foreground mx-3 text-sm">
                      {t("continueWith.anotherMethod")}
                    </p>
                    <Separator className="flex-1" />
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2">
                    {socialAccounts?.map((provider) => (
                      <ProviderButton
                        key={provider.id}
                        className="w-full"
                        provider={provider.id}
                        text={t("continueWith.provider", {
                          provider: provider.name,
                        })}
                      />
                    ))}
                    <PasskeyAuthButton className="w-full" />
                  </div>
                </>
              ) : null}
            </div>
            {!isAuthenticated && type !== "2fa" && type !== "verify-email" && (
              <div className="border-t px-9 py-4">
                {type === "sign-in" ? (
                  <p className="text-muted-foreground text-center text-sm font-medium">
                    {t("formFooter.dontHaveAccount")}{" "}
                    <Link to={`/auth/sign-up${nextPathParam}`} size="sm">
                      {t("signUp")}
                    </Link>
                  </p>
                ) : type === "sign-up" ? (
                  <p className="text-muted-foreground text-center text-sm font-medium">
                    {t("formFooter.haveAccount")}{" "}
                    <Link to={`/auth/sign-in${nextPathParam}`} size="sm">
                      {t("signIn")}
                    </Link>
                  </p>
                ) : type === "forgot-password" ? (
                  <p className="text-muted-foreground text-center text-sm font-medium">
                    {t("formFooter.rememberPassword")}{" "}
                    <Link to={`/auth/sign-in${nextPathParam}`} size="sm">
                      {t("signIn")}
                    </Link>
                  </p>
                ) : type === "reset-password" ? (
                  <p className="text-muted-foreground text-center text-sm font-medium">
                    {t("formFooter.goBackTo")}{" "}
                    <Link to={`/auth/sign-in${nextPathParam}`} size="sm">
                      {t("signIn")}
                    </Link>
                  </p>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
