import type { SignUpSchema } from "@/schemas/auth/sign-up";
import type { CurrentSessionResponse } from "./session";
import { authHttpClient } from "../client";

export async function signUp(data: SignUpSchema) {
  return await authHttpClient.post<CurrentSessionResponse>("/signup", data);
}
