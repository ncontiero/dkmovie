import type { HLSApiAudioTrack, VideoTrack } from "@/utils/types";
import { Check } from "lucide-react";
import { useTranslations } from "use-intl";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";

interface CaptionsAndAudiosProps {
  readonly subtitleTracks: VideoTrack[];
  readonly audioTracks: HLSApiAudioTrack[];
  readonly changeSubtitle: (language: string | null) => void;
  readonly changeAudioTrack: (track: number) => void;
  readonly currentSubtitle?: string | null;
  readonly currentAudioTrack?: number;
}

export function CaptionsAndAudios({
  subtitleTracks,
  audioTracks,
  changeSubtitle,
  changeAudioTrack,
  currentSubtitle,
  currentAudioTrack,
}: CaptionsAndAudiosProps) {
  const t = useTranslations("playerPage.captionsAndAudios");

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="subtitles" className="border-0">
        <AccordionTrigger
          className="
            hover:bg-background/60 flex w-full items-center justify-between gap-1 rounded-md px-4 py-3 font-medium
            duration-200 hover:no-underline
          "
        >
          {t("subtitles")}
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
            {subtitleTracks.map((subtitle) => (
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
      <AccordionItem value="audios" className="border-0">
        <AccordionTrigger
          className="
            hover:bg-background/60 flex w-full items-center justify-between gap-1 rounded-md px-4 py-3 font-medium
            duration-200 hover:no-underline
          "
        >
          {t("audios")}
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
    </Accordion>
  );
}
