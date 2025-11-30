import { type output, email, object } from "zod";

export const changeEmailSchema = object({
  email: email(),
});

export type ChangeEmailSchema = output<typeof changeEmailSchema>;
