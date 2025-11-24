import type { TwoFactorAuthSchema } from "@/schemas/auth/2fa";
import type { CurrentSessionResponse } from "./session";
import { authHttpClient } from "../client";

export async function confirm2FA(data: TwoFactorAuthSchema) {
  return await authHttpClient.post<CurrentSessionResponse>(
    "/2fa/authenticate",
    data,
  );
}
