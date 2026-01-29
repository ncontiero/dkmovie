import { type output, enum as enum_, number, object, string } from "zod";
import { contentsType } from "@/utils/types";

export const searchDialogSchema = object({ search: string().min(1) });
export type SearchDialogSchema = output<typeof searchDialogSchema>;

export const listsParamSchema = object({
  contentTypes: enum_(contentsType).array().optional(),
  genre: string().optional(),
  page: number()
    .default(1)
    .transform((value) => Math.max(value, 1))
    .optional(),
});
export type ListsParamSchema = output<typeof listsParamSchema>;

export const searchParamSchema = listsParamSchema.extend({
  search: string().optional(),
  releaseYear: number().optional(),
});
export type SearchParamSchema = output<typeof searchParamSchema>;
