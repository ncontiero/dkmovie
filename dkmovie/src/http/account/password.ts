import { z } from "zod";
import { passwordSchema } from "@/utils/schemas";
import { authAccountHttpClient } from "../client";

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, {
      message: "Current password is required.",
    }),
    new_password: passwordSchema,
    password_confirmation: z.string().min(1, {
      message: "Password confirmation is required.",
    }),
  })
  .refine((data) => data.new_password === data.password_confirmation, {
    message: "Passwords do not match.",
    path: ["password_confirmation"],
  });

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

export async function changePassword(data: ChangePasswordSchema) {
  return await authAccountHttpClient.post("/password/change", {
    current_password: data.current_password,
    new_password: data.new_password,
  });
}
