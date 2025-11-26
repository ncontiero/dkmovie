import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardFooterDescription,
  CardTitle,
} from "@/components/card";
import { useReAuthenticate } from "@/hooks/use-reauthenticate";
import { useSession } from "@/hooks/use-session";
import {
  disconnectProvider,
  getConnectedProviders,
} from "@/http/account/providers";
import { getSocialAccounts } from "@/http/get-config";
import { needReAuthentication } from "@/utils/auth-flows";
import { getErrorMessage } from "@/utils/errors";
import { AccountCard, AccountCardSkeleton } from "./account-card";

export function ConnectedAccountsCard() {
  const { session } = useSession();
  const { initializeReAuthentication } = useReAuthenticate();
  const queryClient = useQueryClient();

  const { data: socialAccounts, isLoading: isSocialAccountsLoading } = useQuery(
    {
      queryKey: ["social-accounts"],
      queryFn: async () => {
        return await getSocialAccounts();
      },
      staleTime: Infinity,
    },
  );

  const { data: providers, isLoading: isProvidersLoading } = useQuery({
    queryKey: ["connected-accounts"],
    queryFn: async () => {
      return await getConnectedProviders();
    },
    staleTime: Infinity,
    select: (data) => data.data,
  });

  const {
    mutate: disconnectProviderMutation,
    isPending: isDisconnectingProvider,
  } = useMutation({
    mutationFn: async ({
      provider,
      accountId,
    }: {
      provider: string;
      accountId: string;
    }) => {
      return await disconnectProvider(provider, accountId);
    },
    onSuccess: ({ data }) => {
      toast.success("Provider disconnected successfully");
      queryClient.setQueryData(["connected-accounts"], data);
    },
    onError: (error, variables) => {
      if (needReAuthentication(error)) {
        initializeReAuthentication({
          onReAuthenticated: () => {
            disconnectProviderMutation(variables);
          },
        });
        return;
      }
      const errors = getErrorMessage(error);
      if (errors) {
        toast.error(errors);
        return;
      }

      console.error(error);
      toast.error("Failed to disconnect provider");
    },
  });

  return (
    <Card className="mt-10">
      <CardContent>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>Manage your connected accounts.</CardDescription>
        <div className="mt-4 flex flex-col gap-1">
          {isSocialAccountsLoading || isProvidersLoading ? (
            <AccountCardSkeleton />
          ) : (
            <>
              {providers?.map(({ provider, uid }) => (
                <AccountCard
                  key={provider.id}
                  accountId={uid}
                  account={provider}
                  hasPassword={session?.user.has_usable_password}
                  disconnectProvider={disconnectProviderMutation}
                  isDisconnectingProvider={isDisconnectingProvider}
                  initializeReAuthentication={initializeReAuthentication}
                />
              ))}
              {socialAccounts
                ?.filter(
                  (account) =>
                    !providers?.some(
                      ({ provider }) => provider.id === account.id,
                    ),
                )
                .map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    isConnected={false}
                    hasPassword={session?.user.has_usable_password}
                    disconnectProvider={disconnectProviderMutation}
                    isDisconnectingProvider={isDisconnectingProvider}
                    initializeReAuthentication={initializeReAuthentication}
                  />
                ))}
            </>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <CardFooterDescription>
          You can connect additional accounts to your account and manage them
          here.
        </CardFooterDescription>
      </CardFooter>
    </Card>
  );
}
