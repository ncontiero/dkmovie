import type { DisconnectProviderMutation } from "./type";
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
import { useFetchSocialAccounts } from "@/hooks/fetch/use-fetch-social-accounts";
import { useReAuthenticate } from "@/hooks/use-reauthenticate";
import { useSession } from "@/hooks/use-session";
import {
  disconnectProvider,
  getConnectedProviders,
} from "@/http/account/providers";
import { needReAuthentication } from "@/utils/auth-flows";
import { getErrorMessage } from "@/utils/errors";
import { AccountCard, AccountCardSkeleton } from "./account-card";

export function ConnectedAccountsCard() {
  const { session } = useSession();
  const { initializeReAuthentication } = useReAuthenticate();
  const queryClient = useQueryClient();

  const { data: socialAccounts, isLoading: isSocialAccountsLoading } =
    useFetchSocialAccounts();

  const { data: providers, isLoading: isProvidersLoading } = useQuery({
    queryKey: ["connected-accounts"],
    queryFn: getConnectedProviders,
    staleTime: Infinity,
    select: (data) => data.data,
  });

  const {
    mutate: disconnectProviderMutation,
    isPending: isDisconnectingProvider,
  } = useMutation({
    mutationFn: async ({ provider, accountId }: DisconnectProviderMutation) => {
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
            socialAccounts?.map((account) => (
              <AccountCard
                key={account.id}
                provider={providers?.find(
                  ({ provider }) => provider.id === account.id,
                )}
                account={account}
                hasPassword={session?.user.has_usable_password}
                disconnectProvider={disconnectProviderMutation}
                isDisconnectingProvider={isDisconnectingProvider}
                initializeReAuthentication={initializeReAuthentication}
              />
            ))
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
