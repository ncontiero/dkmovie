import { type output, object } from "zod";
import { emailSchema } from "../base";

export const changeEmailSchema = object({
  email: emailSchema,
});

export type ChangeEmailSchema = output<typeof changeEmailSchema>;
