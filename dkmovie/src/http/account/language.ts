import { httpClient } from "../client";

export async function setLanguage(language: string) {
  return await httpClient.post("/language/set-language", { language });
}
