import type { TwoFactorAuthSchema } from "@/schemas/auth/2fa";
import type { ReAuthCodeSchema, ReAuthSchema } from "@/schemas/auth/re-auth";
import type { CurrentSessionResponse } from "./session";
import { authHttpClient } from "../client";

export async function reAuth(data: ReAuthSchema) {
  return await authHttpClient.post<CurrentSessionResponse>(
    "/reauthenticate",
    data,
  );
}

export async function reAuth2FA(data: TwoFactorAuthSchema) {
  return await authHttpClient.post<CurrentSessionResponse>(
    "/2fa/reauthenticate",
    data,
  );
}

export async function requestReAuthCode(data: { email: string }) {
  return await authHttpClient.post("/reauthenticate/code/request", data);
}

export async function resendReAuthCode() {
  return await authHttpClient.post("/reauthenticate/code/resend");
}

export async function confirmReAuthCode(data: ReAuthCodeSchema) {
  return await authHttpClient.post<CurrentSessionResponse>(
    "/reauthenticate/code/confirm",
    data,
  );
}
