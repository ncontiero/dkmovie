import type { CurrentSessionResponse } from "./session";
import { z } from "zod";
import { emailSchema, passwordSchema } from "@/utils/schemas";
import { authHttpClient } from "../client";

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpSchema = z.infer<typeof signUpSchema>;

export async function signUp(data: SignUpSchema) {
  return await authHttpClient.post<CurrentSessionResponse>("/signup", data);
}
