import type {
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "@/schemas/auth/password";
import { authHttpClient } from "../client";

export async function forgotPassword(data: ForgotPasswordSchema) {
  return await authHttpClient.post("/password/request", data);
}

export async function verifyResetKey(key: string) {
  return await authHttpClient.get("/password/reset", {
    headers: { "X-Password-Reset-Key": key },
  });
}

export async function resetPassword(data: ResetPasswordSchema) {
  return await authHttpClient.post(`/password/reset`, data);
}
