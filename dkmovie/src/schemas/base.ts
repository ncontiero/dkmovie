import { string } from "zod";

export const passwordSchema = string()
  .min(8)
  .max(64)
  .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/);
