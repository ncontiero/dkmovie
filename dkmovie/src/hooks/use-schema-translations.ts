import type { $ZodInternalIssue, $ZodIssueCode } from "zod/v4/core";

export type IssueCodeMessage = Partial<Record<$ZodIssueCode, string>>;
interface UseSchemaTranslations<T = unknown> {
  messages?: Record<keyof T, string | IssueCodeMessage>;
  defaultError: string;
}

export function useSchemaTranslations<T = unknown>({
  defaultError,
  messages,
}: UseSchemaTranslations<T>) {
  function schemaTranslator(iss: $ZodInternalIssue) {
    const defaultMessage = { message: defaultError };
    if (!messages) return defaultMessage;

    const path = iss.path?.join(".");
    if (!path) return defaultMessage;

    const message = messages?.[path as keyof T];
    if (!message) return defaultMessage;

    return {
      message:
        typeof message === "string"
          ? message
          : message[iss.code] || defaultError,
    };
  }

  return { schemaTranslator };
}
