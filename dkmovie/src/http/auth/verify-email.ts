import type { CurrentSessionResponse } from "./session";
import { authHttpClient } from "../client";

export async function verifyEmailVerificationKey(key: string) {
  return await authHttpClient.get("/password/reset", {
    headers: { "X-Email-Verification-Key": key },
  });
}

export async function verifyEmail(key: string) {
  return await authHttpClient.post<CurrentSessionResponse>("/email/verify", {
    key,
  });
}
