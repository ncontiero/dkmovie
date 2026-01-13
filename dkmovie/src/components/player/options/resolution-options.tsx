import { Check } from "lucide-react";
import { useTranslations } from "use-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResolutionOptionsProps {
  readonly resolutionLevels: number[];
  readonly currentResolution?: number | null;
  readonly setResolutionLevel: (resolution: number) => void;
}

export function ResolutionOptions({
  resolutionLevels,
  currentResolution,
  setResolutionLevel,
}: ResolutionOptionsProps) {
  const t = useTranslations("playerPage.options.resolution");

  return (
    <AccordionItem value="resolution" className="border-0">
      <AccordionTrigger
        className="
          hover:bg-background/60 flex w-full items-center justify-between gap-1 rounded-md px-4 py-3 font-medium
          duration-200 hover:no-underline
        "
      >
        {t("title")}
      </AccordionTrigger>
      <AccordionContent className="rounded-md pb-0">
        <ul className="flex flex-col">
          <li>
            <Button
              type="button"
              className="hover:bg-background/60 h-auto w-full justify-start px-4 py-3"
              variant="ghost"
              onClick={() => setResolutionLevel(-1)}
            >
              <Check
                className={cn(
                  "duration-200",
                  currentResolution === -1 ? "opacity-100" : "opacity-0",
                )}
              />
              {t("auto")}
              <span className="sr-only">
                {currentResolution === -1
                  ? t("selectedResolution", { resolution: t("auto") })
                  : t("selectResolution", { resolution: t("auto") })}
              </span>
            </Button>
          </li>
          {resolutionLevels.map((level) => (
            <li key={level}>
              <Button
                type="button"
                className="hover:bg-background/60 h-auto w-full justify-start px-4 py-3"
                variant="ghost"
                onClick={() => setResolutionLevel(level)}
              >
                <Check
                  className={cn(
                    "duration-200",
                    currentResolution === level ? "opacity-100" : "opacity-0",
                  )}
                />
                {level}p
                <span className="sr-only">
                  {currentResolution === level
                    ? t("selectedResolution", { resolution: level })
                    : t("selectResolution", { resolution: level })}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}
