import { type output, object, string } from "zod";

export const addPasskeySchema = object({
  name: string().optional().default("WebAuthn"),
});

export type AddPasskeySchema = output<typeof addPasskeySchema>;
