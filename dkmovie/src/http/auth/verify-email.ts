import type { CurrentSessionResponse } from "./session";
import { authHttpClient } from "../client";

export async function verifyEmail(key: string) {
  return await authHttpClient.post<CurrentSessionResponse>("/email/verify", {
    key,
  });
}
