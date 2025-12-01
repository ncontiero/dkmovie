import { type output, object, string } from "zod";

export const confirmTOTPSchema = object({
  code: string().min(1),
});

export type ConfirmTOTPSchema = output<typeof confirmTOTPSchema>;
