import type { Title, WatchHistoryEntry } from "@/utils/types";
import { httpClient } from "../client";

export async function getWatchHistory() {
  try {
    return await httpClient.get<Title[]>("/users/history");
  } catch {
    return [];
  }
}

export function updateWatchHistory(
  titleId: string,
  watchedSeconds: number,
  episodeId?: string,
  watched: boolean = false,
) {
  return httpClient.post<WatchHistoryEntry[]>("/users/history", {
    title_id: titleId,
    watched_seconds: watchedSeconds,
    episode_id: episodeId,
    watched,
  });
}
