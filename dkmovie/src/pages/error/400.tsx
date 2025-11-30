import { TriangleAlert } from "lucide-react";
import { useTranslations } from "use-intl";
import { PageError } from "@/components/page-error";

export default function BadRequestPage() {
  const t = useTranslations("pageError.400");

  return (
    <PageError
      code={400}
      title={t("title")}
      description={t("description")}
      Icon={TriangleAlert}
    />
  );
}
