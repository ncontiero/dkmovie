import { type output, literal, object } from "zod";
import { emailSchema } from "../base";

export const confirmDeleteAccountSchema = object({
  confirmEmail: emailSchema,
  confirmText: literal("delete my account", {
    error: "You must type 'delete my account' to confirm.",
  }),
});

export type ConfirmDeleteAccountSchema = output<
  typeof confirmDeleteAccountSchema
>;
