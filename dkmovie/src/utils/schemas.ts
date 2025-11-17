import { z } from "zod";

export const emailSchema = z.email({
  message: "Please enter a valid email address.",
});

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(64, "Password must be at most 64 characters long")
  .regex(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  );
