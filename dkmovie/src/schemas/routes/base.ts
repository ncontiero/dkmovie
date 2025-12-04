import { object, string } from "zod";

export const nextPathSearchSchema = object({ next: string().optional() });
