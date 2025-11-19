import type { SocialAccount } from "@/http/get-config";
import { Loader } from "lucide-react";
import { GoogleIcon } from "@/components/icons/google";
import { ProviderButton } from "@/components/provider-button";
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
  readonly accountId?: string;
  readonly isConnected?: boolean;
  readonly hasPassword?: boolean;
  readonly disconnectProvider: ({
    provider,
    accountId,
  }: {
    provider: string;
    accountId: string;
  }) => void;
  readonly isDisconnectingProvider?: boolean;
}

export function AccountCard({
  account,
  accountId,
  isConnected = true,
  hasPassword = false,
  isDisconnectingProvider = false,
  disconnectProvider,
}: AccountCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {account.id === "google" && <GoogleIcon className="size-6" />}
          <div className="flex flex-col gap-1">
            <p className="space-x-2 font-semibold">
              <span>{account.name}</span>
              <Badge
                variant={isConnected ? "defaultOutline" : "destructiveOutline"}
              >
                {isConnected ? "Connected" : "Not Connected"}
              </Badge>
            </p>
            <p className="text-muted-foreground text-sm">
              {isConnected
                ? `You can sign in with your ${account.name} account`
                : `Sign in with your ${account.name} account`}
            </p>
          </div>
        </div>
        {!isConnected || !accountId ? (
          <ProviderButton
            text="Connect"
            addIcon={false}
            process="connect"
            provider={account.id}
          />
        ) : hasPassword ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDisconnectingProvider}
              >
                {isDisconnectingProvider ? (
                  <Loader className="animate-spin" />
                ) : (
                  "Disconnect"
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Disconnect {account.name} account
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to disconnect your {account.name}{" "}
                  account? You will no longer be able to sign in with this
                  account.
                </AlertDialogDescription>
                <AlertDialogFooter className="mt-4">
                  <AlertDialogCancel asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      type="button"
                      onClick={() =>
                        disconnectProvider({ provider: account.id, accountId })
                      }
                    >
                      Disconnect
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
