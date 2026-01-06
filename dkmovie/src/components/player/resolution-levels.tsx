import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useTranslations } from "use-intl";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

interface ResolutionLevelsProps {
  readonly resolutionLevels: number[];
  readonly currentResolution?: number | null;
  readonly setResolutionLevel: (resolution: number) => void;
}

export function ResolutionLevels({
  resolutionLevels,
  currentResolution,
  setResolutionLevel,
}: ResolutionLevelsProps) {
  const t = useTranslations("playerPage");
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full">
      <CollapsibleTrigger
        className="
          hover:bg-background/60 flex w-full items-center justify-between gap-1 rounded-md px-4 py-3 font-medium
          duration-200
        "
      >
        {t("videoQuality")}
        <ChevronDown
          className={`${open ? "rotate-180" : ""} size-4 duration-200`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="rounded-md">
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
      </CollapsibleContent>
    </Collapsible>
  );
}
