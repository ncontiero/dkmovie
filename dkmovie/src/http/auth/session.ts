import type { Session } from "@/utils/types";
import { authHttpClient } from "../client";

export interface CurrentSessionResponse {
  data: Session;
  meta: {
    is_authenticated: boolean;
  };
}

export async function getCurrentSession() {
  return await authHttpClient.get<CurrentSessionResponse>("/session");
}

export async function logout() {
  try {
    return await authHttpClient.delete("/session");
  } catch {
    return null;
  }
}
