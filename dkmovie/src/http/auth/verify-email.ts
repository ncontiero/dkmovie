import type { CurrentSessionResponse } from "./session";
import { z } from "zod";
import { authHttpClient } from "../client";

export const verifyEmailSchema = z.object({
  key: z.string().min(1, { message: "Code is required." }),
});
export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;

export async function verifyEmail(data: VerifyEmailSchema) {
  return await authHttpClient.post<CurrentSessionResponse>(
    "/email/verify",
    data,
  );
}

export async function resentEmailVerification() {
  return await authHttpClient.post("/email/verify/resend");
}
