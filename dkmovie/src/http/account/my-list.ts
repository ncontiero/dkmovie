import { httpClient } from "../client";

export function addToMyList(titleId: string) {
  return httpClient.post<string[]>(`/users/my_list/${titleId}`);
}

export function removeFromMyList(titleId: string) {
  return httpClient.delete<string[]>(`/users/my_list/${titleId}`);
}
