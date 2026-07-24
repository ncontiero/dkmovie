import type { $ZodInternalIssue, $ZodIssueCode } from "zod/v4/core";
import { useCallback } from "react";

export type IssueCodeMessage = Partial<Record<$ZodIssueCode, string>>;
interface UseSchemaTranslations<T = unknown> {
  messages?: Record<keyof T, string | IssueCodeMessage>;
  defaultError: string;
}

export function useSchemaTranslations<T = unknown>({
  defaultError,
  messages,
}: UseSchemaTranslations<T>) {
  const schemaTranslator = useCallback(
    (iss: $ZodInternalIssue) => {
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
            : (message as any)[iss.code] || defaultError,
      };
    },
    [defaultError, messages],
  );

  return { schemaTranslator };
}
