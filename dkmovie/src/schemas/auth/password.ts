import { type output, email, object, string } from "zod";
import { passwordSchema } from "../base";

export const forgotPasswordSchema = object({
  email: email(),
});

export type ForgotPasswordSchema = output<typeof forgotPasswordSchema>;

export const resetPasswordSchema = object({
  key: string().min(1),
  password: passwordSchema,
  passwordConfirmation: string().min(1),
}).refine((data) => data.password === data.passwordConfirmation, {
  path: ["passwordConfirmation"],
});

export type ResetPasswordSchema = output<typeof resetPasswordSchema>;
