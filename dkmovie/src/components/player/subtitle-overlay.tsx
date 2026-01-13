import { useEffect, useState } from "react";

import { useTranslations } from "use-intl";
import { cn } from "@/lib/utils";
import { type VTTCue, parseVTT } from "@/utils/vtt-parser";

interface SubtitleOverlayProps {
  readonly url: string | null;
  readonly currentTime: number;
  readonly className?: string;
}

export function SubtitleOverlay({
  url,
  currentTime,
  className,
}: SubtitleOverlayProps) {
  const t = useTranslations("playerPage.options.subtitles");
  const [cues, setCues] = useState<VTTCue[]>([]);

  useEffect(() => {
    if (!url) {
      return;
    }

    fetch(url)
      .then((res) => res.text())
      .then((text) => setCues(parseVTT(text)))
      .catch(() => setCues([]));
  }, [url]);

  const activeCue = cues.find(
    (c) => currentTime >= c.start && currentTime <= c.end,
  );

  if (!activeCue) return null;

  return (
    <div
      className={cn("pointer-events-none absolute p-4 text-center", className)}
      aria-label={t("title")}
      aria-live="polite"
      aria-atomic="true"
    >
      <span
        className="
          inline-block rounded-sm bg-black/60 px-3 py-1.5 text-xl text-[clamp(1rem,4vw,2rem)] leading-snug text-white
          backdrop-blur-lg lg:text-4xl
        "
        style={{
          textShadow: "0px 1px 2px rgba(0,0,0,0.8)",
        }}
      >
        {activeCue.text.split("\n").map((line, index, arr) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={index}>
            {line}
            {index < arr.length - 1 && <br />}
          </span>
        ))}
      </span>
    </div>
  );
}
