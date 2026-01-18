import type { Episode } from "@/utils/types";
import { getLangCookie } from "@/utils/cookies";
import { httpClient } from "./client";

export async function getSeasonEpisodes(titleId: string, seasonNumber: number) {
  return await httpClient.get<Episode[]>(
    `/titles/${titleId}/season/${seasonNumber}/episodes?lang=${getLangCookie()}`,
  );
}
