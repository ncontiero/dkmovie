import { type output, object, string } from "zod";

export const reAuthSchema = object({
  password: string().min(1),
});

export type ReAuthSchema = output<typeof reAuthSchema>;
