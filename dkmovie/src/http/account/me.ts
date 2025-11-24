import type { UpdateMeSchema } from "@/schemas/account/me";
import type { User } from "@/utils/types";
import { httpClient } from "../client";

export async function getMe() {
  try {
    return await httpClient.get<User>("/users/me");
  } catch {
    return null;
  }
}

export async function updateMe(data: UpdateMeSchema) {
  return await httpClient.patch<User>("/users/me", data);
}

export async function deleteMyAccount() {
  return await httpClient.delete("/users/me");
}
