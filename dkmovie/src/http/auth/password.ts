import { z } from "zod";
import { emailSchema, passwordSchema } from "@/utils/schemas";
import { authHttpClient } from "../client";

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export async function forgotPassword(data: ForgotPasswordSchema) {
  return await authHttpClient.post("/password/request", data);
}

export async function verifyResetKey(key: string) {
  return await authHttpClient.get("/password/reset", {
    headers: { "X-Password-Reset-Key": key },
  });
}

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    passwordConfirmation: z.string().min(1, {
      message: "Password confirmation is required.",
    }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export async function resetPassword(key: string, data: ResetPasswordSchema) {
  return await authHttpClient.post(`/password/reset`, {
    key,
    password: data.password,
  });
}
