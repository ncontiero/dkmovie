import { ServerCrash } from "lucide-react";
import { useTranslations } from "use-intl";
import { PageError } from "./error-component";

export function InternalServerErrorComponent() {
  const t = useTranslations("pageError.500");

  return (
    <PageError
      code={500}
      title={t("title")}
      description={t("description")}
      Icon={ServerCrash}
    />
  );
}
