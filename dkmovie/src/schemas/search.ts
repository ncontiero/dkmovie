import { type output, enum as enum_, object, string } from "zod";
import { contentsType } from "@/utils/types";

export const searchDialogSchema = object({ search: string().min(1) });
export type SearchDialogSchema = output<typeof searchDialogSchema>;

export const searchParamSchema = object({
  search: string().optional(),
  contentTypes: enum_(contentsType).array().optional(),
  genre: string().optional(),
});
export type SearchParamSchema = output<typeof searchParamSchema>;
