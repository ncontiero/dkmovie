import { ServerCrash } from "lucide-react";
import { useTranslations } from "use-intl";
import { PageError } from "@/components/page-error";

export default function InternalServerErrorPage() {
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
