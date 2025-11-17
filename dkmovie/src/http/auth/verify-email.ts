import { z } from "zod";
import { authHttpClient } from "../client";

export const verifyEmailSchema = z.object({
  key: z.string().min(1, "Code is required"),
});

export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;

export async function verifyEmail(data: VerifyEmailSchema) {
  await authHttpClient.post("/email/verify", data);
}

export async function resentEmailVerification() {
  return await authHttpClient.post("/email/verify/resend");
}
