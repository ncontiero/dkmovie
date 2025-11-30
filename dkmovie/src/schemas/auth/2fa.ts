import { type output, object, string } from "zod";

export const twoFactorAuthSchema = object({
  code: string().min(1),
});

export type TwoFactorAuthSchema = output<typeof twoFactorAuthSchema>;
