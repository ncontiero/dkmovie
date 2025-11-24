import { type output, object, string } from "zod";
import { emailSchema } from "../base";

export const signInSchema = object({
  email: emailSchema,
  password: string().min(1, { message: "Password is required." }),
});

export type SignInSchema = output<typeof signInSchema>;
