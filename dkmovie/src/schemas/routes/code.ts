import { object, string } from "zod";

export const codeSearchSchema = object({ code: string().optional() });
