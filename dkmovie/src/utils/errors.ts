import { HTTPError } from "@/http/client";

export function getErrorMessage(error: unknown) {
  if (error instanceof HTTPError) {
    if (error.data?.message) return error.data.message as string;
    if (error.status === 400) {
      const errors = error.data?.errors?.map((e: any) => e.message) || [];
      if (errors.length === 0) return;
      return errors.join(". ") as string;
    }
  }

  return;
}
