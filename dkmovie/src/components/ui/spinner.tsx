import type { ComponentProps } from "react";
import { Loader2Icon } from "lucide-react";
import { useTranslations } from "use-intl";
import { cn } from "@/lib/utils";

export function Spinner({ className, ...props }: ComponentProps<"svg">) {
  const t = useTranslations("common");

  return (
    <Loader2Icon
      role="status"
      aria-label={t("loading")}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}
