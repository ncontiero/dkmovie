import type { User } from "@/utils/types";
import { z } from "zod";
import { httpClient } from "../client";

export async function getMe() {
  try {
    return await httpClient.get<User>("/users/me");
  } catch {
    return null;
  }
}

export const updateMeSchema = z.object({
  name: z
    .string()
    .min(4, "Name must be at least 4 characters long")
    .max(255, "Name must be less than 255 characters long"),
});
export type UpdateMeSchema = z.infer<typeof updateMeSchema>;

export async function updateMe(data: UpdateMeSchema) {
  return await httpClient.patch<User>("/users/me", data);
}

export async function deleteMyAccount() {
  return await httpClient.delete("/users/me");
}
