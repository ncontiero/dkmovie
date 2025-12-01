import { type output, object, string } from "zod";
import { passwordSchema } from "../base";

export const changePasswordSchema = object({
  current_password: string().min(1),
  new_password: passwordSchema,
  password_confirmation: string().min(1),
}).refine((data) => data.new_password === data.password_confirmation, {
  path: ["password_confirmation"],
});

export type ChangePasswordSchema = output<typeof changePasswordSchema>;
