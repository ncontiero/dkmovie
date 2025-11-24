import type { ChangeEmailSchema } from "@/schemas/account/email";
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

export async function changeEmail(data: ChangeEmailSchema) {
  return await authAccountHttpClient.post<EmailResponse>("/email", data);
}
