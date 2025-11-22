import type { Session } from "@/utils/types";
import { need2FA } from "@/utils/erros";
import { authHttpClient } from "../client";

export interface CurrentSessionResponse {
  data: Session;
  meta: {
    is_authenticated: boolean;
  };
}

export async function getCurrentSession() {
  try {
    return await authHttpClient.get<CurrentSessionResponse>("/session");
  } catch (error) {
    if (need2FA(error)) throw error;
    return null;
  }
}

export async function logout() {
  try {
    return await authHttpClient.delete("/session");
  } catch {
    return null;
  }
}
