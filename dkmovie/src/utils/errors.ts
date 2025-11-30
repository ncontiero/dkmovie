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

interface TranslateZodErrorProps {
  iss: any;
  messages: Record<string, string> | Record<string, Record<string, string>>;
  defaultError: string;
}

export function translateZodError({
  iss,
  messages,
  defaultError,
}: TranslateZodErrorProps) {
  const path = iss?.path?.join(".");
  if (!path) return { message: defaultError };

  const code = iss?.code;
  const message = messages[path];

  const codeMessage = typeof message === "object" ? message[code] : undefined;
  if (codeMessage) return { message: codeMessage };

  if (typeof message === "string") return { message };
  return { message: defaultError };
}
