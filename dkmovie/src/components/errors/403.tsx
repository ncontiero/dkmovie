import { ShieldBan } from "lucide-react";
import { useTranslations } from "use-intl";
import { PageError } from "./error-component";

export function ForbiddenComponent() {
  const t = useTranslations("pageError.403");

  return (
    <PageError
      code={403}
      title={t("title")}
      description={t("description")}
      Icon={ShieldBan}
    />
  );
}
