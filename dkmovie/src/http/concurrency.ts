import { httpClient } from "./client";

export async function sendHeartbeat(sessionId: string) {
  return await httpClient.post<{ allowed: boolean }>(
    "/streaming/sessions/heartbeat",
    { session_id: sessionId },
  );
}

export async function releaseSession(sessionId: string) {
  return await httpClient.post("/streaming/sessions/release", {
    session_id: sessionId,
  });
}
