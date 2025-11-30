import type { InitializeReAuthentication } from "@/context/reauthenticate/context";
import type { ProvidersResponse } from "@/http/account/providers";
import type { SocialAccount } from "@/http/get-config";
import type { DisconnectProviderMutation } from "./type";
import { useTranslations } from "use-intl";
import { ProviderButton, ProviderIcon } from "@/components/provider-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface AccountCardProps {
  readonly account: SocialAccount;
  readonly provider?: ProvidersResponse["data"][0];
  readonly hasPassword?: boolean;
  readonly disconnectProvider: (props: DisconnectProviderMutation) => void;
  readonly isDisconnectingProvider?: boolean;
  readonly initializeReAuthentication: InitializeReAuthentication;
}

export function AccountCard({
  account,
  provider,
  hasPassword = false,
  isDisconnectingProvider = false,
  disconnectProvider,
  initializeReAuthentication,
}: AccountCardProps) {
  const t = useTranslations("securityPage.socialAccount");
  const isConnected = !!provider;
  const accountId = provider?.uid;

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ProviderIcon provider={account.id} className="size-6" />
          <div className="flex flex-col gap-1">
            <p className="space-x-2 font-semibold">
              <span>{account.name}</span>
              <Badge
                variant={isConnected ? "defaultOutline" : "destructiveOutline"}
              >
                {isConnected ? t("connected") : t("notConnected")}
              </Badge>
            </p>
            <p className="text-muted-foreground text-sm">
              {isConnected
                ? t("youCanSignIn", { accountName: account.name })
                : t("signInWithYourAccount", { accountName: account.name })}
            </p>
          </div>
        </div>
        {!isConnected || !accountId ? (
          <ProviderButton
            text={t("connect")}
            addIcon={false}
            process="connect"
            provider={account.id}
            initializeReAuthentication={initializeReAuthentication}
          />
        ) : hasPassword ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={isDisconnectingProvider}
              >
                {t("disconnect")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("disconnectAccount", { accountName: account.name })}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("disconnectAccountDescription", {
                    accountName: account.name,
                  })}
                </AlertDialogDescription>
                <AlertDialogFooter className="mt-4">
                  <AlertDialogCancel asChild>
                    <Button type="button" variant="outline">
                      {t("cancel")}
                    </Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      type="button"
                      onClick={() =>
                        disconnectProvider({ provider: account.id, accountId })
                      }
                    >
                      {t("disconnect")}
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogHeader>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>
    </div>
  );
}

export function AccountCardSkeleton() {
  return (
    <Skeleton className="w-full rounded-lg px-2 py-4">
      <div className="flex items-center gap-2">
        <Skeleton className="bg-background size-10" />
        <div className="flex w-full flex-col gap-1">
          <Skeleton className="bg-background h-5 w-1/12" />
          <Skeleton className="bg-background h-5 w-1/3" />
        </div>
      </div>
    </Skeleton>
  );
}
