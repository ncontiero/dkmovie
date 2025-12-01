import { type output, email, object, string } from "zod";
import { passwordSchema } from "../base";

export const signUpSchema = object({
  email: email(),
  password: passwordSchema,
  confirmPassword: string().min(1),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
});

export type SignUpSchema = output<typeof signUpSchema>;
