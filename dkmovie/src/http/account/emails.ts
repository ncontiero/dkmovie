import { z } from "zod";
import { emailSchema } from "@/utils/schemas";
import { authAccountHttpClient } from "../client";

export interface Email {
  email: string;
  verified: boolean;
  primary: boolean;
}
interface EmailResponse {
  data: Email[];
}

export async function getUserEmails() {
  try {
    const response = await authAccountHttpClient.get<EmailResponse>("/email");
    return response.data || [];
  } catch {
    return [];
  }
}

export const addEmailSchema = z.object({
  email: emailSchema,
});
export type AddEmailSchema = z.infer<typeof addEmailSchema>;

export async function addEmail(data: AddEmailSchema) {
  return await authAccountHttpClient.post<EmailResponse>("/email", data);
}

export async function deleteEmail(data: AddEmailSchema) {
  return await authAccountHttpClient.delete<EmailResponse>("/email", data);
}

export async function setPrimaryEmail(email: string) {
  return await authAccountHttpClient.patch<EmailResponse>("/email", {
    email,
    primary: true,
  });
}
