import { email, object } from "zod";

export const emailSearchSchema = object({ email: email().optional() });
