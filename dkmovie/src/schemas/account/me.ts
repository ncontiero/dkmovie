import { type output, object, string } from "zod";

export const updateMeSchema = object({
  name: string().min(4).max(255),
});

export type UpdateMeSchema = output<typeof updateMeSchema>;
