import type { CurrentSessionResponse } from "./session";
import { z } from "zod";
import { authHttpClient } from "../client";

export const twoFactorAuthSchema = z.object({
  code: z.string().min(1, { message: "Code is required." }),
});

export type TwoFactorAuthSchema = z.infer<typeof twoFactorAuthSchema>;

export async function confirm2FA(data: TwoFactorAuthSchema) {
  return await authHttpClient.post<CurrentSessionResponse>(
    "/2fa/authenticate",
    data,
  );
}
