import { type output, object, string } from "zod";
import { emailSchema, passwordSchema } from "../base";

export const signUpSchema = object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: string().min(1, {
    message: "Please confirm your password.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignUpSchema = output<typeof signUpSchema>;
