import { type output, email, object, string } from "zod";

export const confirmDeleteAccountSchema = object({
  confirmEmail: email(),
  confirmText: string(),
});

export type ConfirmDeleteAccountSchema = output<
  typeof confirmDeleteAccountSchema
>;
