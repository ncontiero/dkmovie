import type { SignInSchema } from "@/schemas/auth/sign-in";
import type { CurrentSessionResponse } from "./session";
import { authHttpClient } from "../client";

export async function signIn(data: SignInSchema) {
  return await authHttpClient.post<CurrentSessionResponse>("/login", data);
}
