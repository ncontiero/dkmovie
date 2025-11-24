import type { ChangePasswordSchema } from "@/schemas/account/password";
import { authAccountHttpClient } from "../client";

export async function changePassword(
  data: ChangePasswordSchema,
  userHasPassword: boolean = true,
) {
  const newData = {
    new_password: data.new_password,
    ...(userHasPassword && { current_password: data.current_password }),
  };
  return await authAccountHttpClient.post("/password/change", newData);
}
