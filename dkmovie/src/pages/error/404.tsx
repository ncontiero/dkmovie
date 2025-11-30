import { AlertTriangle } from "lucide-react";
import { useTranslations } from "use-intl";
import { PageError } from "@/components/page-error";

export default function PageNotFound() {
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
