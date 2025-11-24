import { type output, object, string } from "zod";
import { passwordSchema } from "../base";

export const changePasswordSchema = object({
  current_password: string().min(1, {
    message: "Current password is required.",
  }),
  new_password: passwordSchema,
  password_confirmation: string().min(1, {
    message: "Password confirmation is required.",
  }),
}).refine((data) => data.new_password === data.password_confirmation, {
  message: "Passwords do not match.",
  path: ["password_confirmation"],
});

export type ChangePasswordSchema = output<typeof changePasswordSchema>;
