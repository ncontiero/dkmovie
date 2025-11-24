import { type output, object, string } from "zod";

export const updateMeSchema = object({
  name: string()
    .min(4, "Name must be at least 4 characters long")
    .max(255, "Name must be less than 255 characters long"),
});

export type UpdateMeSchema = output<typeof updateMeSchema>;
