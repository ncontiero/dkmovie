import { AlertTriangle } from "lucide-react";
import { useTranslations } from "use-intl";
import { PageError } from "./error-component";

export function NotFoundComponent() {
  const t = useTranslations("pageError.404");

  return (
    <PageError
      code={404}
      title={t("title")}
      description={t("description")}
      Icon={AlertTriangle}
    />
  );
}
