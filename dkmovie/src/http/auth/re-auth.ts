import type { ReAuthSchema } from "@/schemas/auth/re-auth";
import type { CurrentSessionResponse } from "./session";
import { authHttpClient } from "../client";

export async function reAuth(data: ReAuthSchema) {
  return await authHttpClient.post<CurrentSessionResponse>(
    "/reauthenticate",
    data,
  );
}
