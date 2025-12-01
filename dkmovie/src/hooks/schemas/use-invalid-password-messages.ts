import type { IssueCodeMessage } from "../use-schema-translations";
import { useTranslations } from "use-intl";

export function useInvalidPasswordMessages() {
  const t = useTranslations("common.errors.password");

  const invalidPasswordMessages: IssueCodeMessage = {
    too_small: t("minCharacter"),
    too_big: t("maxCharacter"),
    invalid_format: t("regex"),
  };
  const invalidConfirmPasswordMessages: IssueCodeMessage = {
    too_small: t("confirmIsRequired"),
    custom: t("passwordsDoNotMatch"),
  };

  return {
    invalidPasswordMessages,
    invalidConfirmPasswordMessages,
  };
}
