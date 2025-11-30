import { type output, object, string } from "zod";

export const verifyEmailSchema = object({
  key: string().min(1),
});

export type VerifyEmailSchema = output<typeof verifyEmailSchema>;
