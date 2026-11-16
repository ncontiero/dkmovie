import { type output, object, string } from "zod";

export const reAuthSchema = object({
  password: string().min(1),
});

export type ReAuthSchema = output<typeof reAuthSchema>;

export const reAuthCodeSchema = object({
  code: string().min(1),
});

export type ReAuthCodeSchema = output<typeof reAuthCodeSchema>;
