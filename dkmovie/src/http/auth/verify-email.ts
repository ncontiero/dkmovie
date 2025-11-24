import type { VerifyEmailSchema } from "@/schemas/auth/verify-email";
import type { CurrentSessionResponse } from "./session";
import { authHttpClient } from "../client";

export async function verifyEmail(data: VerifyEmailSchema) {
  return await authHttpClient.post<CurrentSessionResponse>(
    "/email/verify",
    data,
  );
}

export async function resentEmailVerification() {
  return await authHttpClient.post("/email/verify/resend");
}
