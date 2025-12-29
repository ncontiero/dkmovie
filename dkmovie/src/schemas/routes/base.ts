import { object, string } from "zod";

export const rootSearchSchema = object({
  next: string().optional(),
});
