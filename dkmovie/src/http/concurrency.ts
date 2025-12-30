import { httpClient } from "./client";

export async function sendHeartbeat(sessionId: string) {
  return await httpClient.post<{ allowed: boolean }>("/streaming/heartbeat", {
    session_id: sessionId,
  });
}

export async function releaseSession(sessionId: string) {
  return await httpClient.post("/streaming/release", {
    session_id: sessionId,
  });
}
