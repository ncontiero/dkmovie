import { authHttpClient } from "../client";

export interface SessionItem {
  id: number;
  ip: string;
  is_current: boolean;
  user_agent: string;
  created_at: number;
  last_seen_at?: number;
}
interface SessionsResponse {
  data: SessionItem[];
}

export async function getSessions() {
  return await authHttpClient.get<SessionsResponse>("/sessions");
}

export async function deleteSessions(sessions: number[]) {
  return await authHttpClient.delete<SessionsResponse>("/sessions", {
    sessions,
  });
}
