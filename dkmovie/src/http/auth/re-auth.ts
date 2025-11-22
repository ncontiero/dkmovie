import type { CurrentSessionResponse } from "./session";
import { z } from "zod";
import { authHttpClient } from "../client";

export const reAuthSchema = z.object({
  password: z.string().min(1, { message: "Password is required." }),
});

export type ReAuthSchema = z.infer<typeof reAuthSchema>;

export async function reAuth(data: ReAuthSchema) {
  return await authHttpClient.post<CurrentSessionResponse>(
    "/reauthenticate",
    data,
  );
}
