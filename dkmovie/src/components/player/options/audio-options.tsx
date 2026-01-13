import type { HLSApiAudioTrack } from "@/utils/types";
import { Check } from "lucide-react";
import { useTranslations } from "use-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioOptionsProps {
  readonly audioTracks: HLSApiAudioTrack[];
  readonly changeAudioTrack: (track: number) => void;
  readonly currentAudioTrack?: number;
}

export function AudioOptions({
  audioTracks,
  changeAudioTrack,
  currentAudioTrack,
}: AudioOptionsProps) {
  const t = useTranslations("playerPage.options.audio");

  return (
    <AccordionItem value="audios" className="border-0">
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
          {audioTracks.map((audio) => (
            <li key={audio.id}>
              <Button
                type="button"
                className="hover:bg-background/60 h-auto w-full justify-start px-4 py-3"
                variant="ghost"
                onClick={() => changeAudioTrack(audio.id)}
              >
                <Check
                  className={cn(
                    "duration-200",
                    currentAudioTrack === audio.id
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                {audio.name}
                <span className="sr-only">
                  {currentAudioTrack === audio.id
                    ? t("selectedAudio", { audio: audio.name })
                    : t("selectAudio", { audio: audio.name })}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}
