import { type output, object, string } from "zod";

export const searchDialogSchema = object({ search: string().min(1) });
export type SearchDialogSchema = output<typeof searchDialogSchema>;

export const searchParamSchema = object({ search: string().optional() });
export type SearchParamSchema = output<typeof searchParamSchema>;
