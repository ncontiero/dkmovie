import { z } from "zod";
import { emailSchema } from "@/utils/schemas";
import { authHttpClient } from "../client";

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required." }),
});

export type SignInSchema = z.infer<typeof signInSchema>;

export async function signIn(data: SignInSchema) {
  await authHttpClient.post("/login", data);
}
