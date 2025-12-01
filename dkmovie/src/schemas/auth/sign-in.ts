import { type output, email, object, string } from "zod";

export const signInSchema = object({
  email: email(),
  password: string().min(1),
});

export type SignInSchema = output<typeof signInSchema>;
