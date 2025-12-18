import type { Episode } from "@/utils/types";
import { httpClient } from "./client";

export async function getSeasonEpisodes(titleId: string, seasonNumber: number) {
  return await httpClient.get<Episode[]>(
    `/titles/${titleId}/season/${seasonNumber}/episodes`,
  );
}
