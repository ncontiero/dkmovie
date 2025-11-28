import type { SocialAccount } from "../get-config";
import { authAccountHttpClient } from "../client";

export interface ProvidersResponse {
  data: { provider: SocialAccount; uid: string }[];
}

export async function getConnectedProviders() {
  return await authAccountHttpClient.get<ProvidersResponse>("/providers");
}

export async function disconnectProvider(provider: string, accountId: string) {
  return await authAccountHttpClient.delete<ProvidersResponse>("/providers", {
    provider,
    account: accountId,
  });
}
