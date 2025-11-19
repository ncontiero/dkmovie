import { apiAuthBasePath, HttpClient } from "./client";

const authConfigHttpClient = new HttpClient(`${apiAuthBasePath}/config`);

export interface SocialAccount {
  id: string;
  name: string;
}

export interface GetConfigResponse {
  data: {
    socialaccount: {
      providers: SocialAccount[];
    };
  };
}

export async function getConfig() {
  return await authConfigHttpClient.get<GetConfigResponse>("");
}

export async function getSocialAccounts() {
  const config = await getConfig();
  return config.data.socialaccount.providers;
}
