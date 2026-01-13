import type { VideoTrack } from "@/utils/types";
import { Check } from "lucide-react";
import { useTranslations } from "use-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubtitleOptionsProps {
  readonly subtitles: VideoTrack[];
  readonly changeSubtitle: (language: string | null) => void;
  readonly currentSubtitle?: string | null;
}

export function SubtitleOptions({
  subtitles,
  currentSubtitle,
  changeSubtitle,
}: SubtitleOptionsProps) {
  const t = useTranslations("playerPage.options.subtitles");

  return (
    <AccordionItem value="subtitles" className="border-0">
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
              onClick={() => changeSubtitle(null)}
            >
              <Check
                className={cn(
                  "duration-200",
                  currentSubtitle === null ? "opacity-100" : "opacity-0",
                )}
              />
              {t("off")}
            </Button>
          </li>
          {subtitles.map((subtitle) => (
            <li key={subtitle.language}>
              <Button
                type="button"
                className="hover:bg-background/60 h-auto w-full justify-start px-4 py-3"
                variant="ghost"
                onClick={() => changeSubtitle(subtitle.language)}
              >
                <Check
                  className={cn(
                    "duration-200",
                    currentSubtitle === subtitle.language
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                {subtitle.label}
                <span className="sr-only">
                  {currentSubtitle === subtitle.language
                    ? t("selectedSubtitle", { subtitle: subtitle.label })
                    : t("selectSubtitle", { subtitle: subtitle.label })}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}
