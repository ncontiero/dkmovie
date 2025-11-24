import { type output, object, string } from "zod";
import { emailSchema, passwordSchema } from "../base";

export const forgotPasswordSchema = object({
  email: emailSchema,
});

export type ForgotPasswordSchema = output<typeof forgotPasswordSchema>;

export const resetPasswordSchema = object({
  key: string().min(1, { message: "Code is required." }),
  password: passwordSchema,
  passwordConfirmation: string().min(1, {
    message: "Password confirmation is required.",
  }),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Passwords do not match.",
  path: ["passwordConfirmation"],
});

export type ResetPasswordSchema = output<typeof resetPasswordSchema>;
