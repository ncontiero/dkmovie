import type { VideoSprite } from "@/utils/types";
import { type MouseEvent, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "use-intl";
import { Slider } from "../ui/slider";

interface TimelineProps {
  readonly sprites: VideoSprite[];
  readonly currentTime: number;
  readonly duration: number;
  readonly onValueChange: (value: number) => void;
  readonly disabled?: boolean;
  readonly haveNextEpisode?: boolean;
  readonly titleId: string;
  readonly nextEpisodeId?: string;
}

interface SpriteThumbnailProps {
  readonly sprite: VideoSprite;
  readonly hoverTime: number;
}

function SpriteThumbnail({ hoverTime, sprite }: SpriteThumbnailProps) {
  const thumbStyle = useMemo(() => {
    const timeInSprite = Math.max(0, hoverTime - sprite.start_time);

    let frameIndex = Math.floor(timeInSprite / sprite.interval);
    const maxFrames = Math.ceil(
      (sprite.end_time - sprite.start_time) / sprite.interval,
    );

    if (frameIndex >= maxFrames) {
      frameIndex = maxFrames - 1;
    }

    const col = frameIndex % sprite.columns;
    const row = Math.floor(frameIndex / sprite.columns);

    const bgX = -col * sprite.frame_width;
    const bgY = -row * sprite.frame_height;

    return {
      backgroundImage: `url(${sprite.image})`,
      backgroundPosition: `${bgX}px ${bgY}px`,
      width: `${sprite.frame_width}px`,
      height: `${sprite.frame_height}px`,
      backgroundRepeat: "no-repeat",
    };
  }, [sprite, hoverTime]);

  return (
    <div
      className="rounded-sm border border-white/20 bg-black shadow-lg"
      style={thumbStyle}
    />
  );
}

export function Timeline({
  sprites,
  currentTime,
  duration,
  onValueChange,
  disabled,
  haveNextEpisode,
  titleId,
  nextEpisodeId,
}: TimelineProps) {
  const t = useTranslations("playerPage");
  const [hoverTime, setHoverTime] = useState(0);
  const [hoverPos, setHoverPos] = useState(0);
  const [showThumb, setShowThumb] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentTimeFormatted = useMemo(() => {
    const currentHours = Math.floor(currentTime / 3600);
    const currentMinutes = Math.floor((currentTime % 3600) / 60);
    const currentSeconds = Math.floor(currentTime % 60);

    const minutesAndSeconds = `${currentMinutes
      .toString()
      .padStart(2, "0")}:${currentSeconds.toString().padStart(2, "0")}`;

    if (currentHours > 0) {
      return `${currentHours.toString().padStart(2, "0")}:${minutesAndSeconds}`;
    }

    return minutesAndSeconds;
  }, [currentTime]);

  const durationFormatted = useMemo(() => {
    const durationHours = Math.floor(duration / 3600);
    const durationMinutes = Math.floor((duration % 3600) / 60);
    const durationSeconds = duration % 60;

    const minutesAndSeconds = `${durationMinutes
      .toString()
      .padStart(2, "0")}:${durationSeconds.toString().padStart(2, "0")}`;

    if (durationHours > 0) {
      return `${durationHours.toString().padStart(2, "0")}:${minutesAndSeconds}`;
    }

    return minutesAndSeconds;
  }, [duration]);

  const activeSprite = useMemo(() => {
    if (!showThumb || duration === 0) return undefined;
    return sprites.find(
      (s) => hoverTime >= s.start_time && hoverTime < s.end_time,
    );
  }, [duration, hoverTime, showThumb, sprites]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setContainerWidth(rect.width);

    const offsetX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = offsetX / rect.width;

    setHoverPos(offsetX);
    setHoverTime(percentage * duration);
    setShowThumb(true);
  };

  const safeLeftPos = useMemo(() => {
    if (activeSprite && containerWidth > 0) {
      const halfThumb = activeSprite.frame_width / 2;
      let pos = Math.max(halfThumb, hoverPos);
      pos = Math.min(containerWidth - halfThumb, pos);
      return pos;
    }
  }, [activeSprite, containerWidth, hoverPos]);

  return (
    <div className="group/slider-container absolute inset-x-6 bottom-4 lg:inset-x-20 lg:bottom-6">
      {showThumb && activeSprite ? (
        <div
          className="
            pointer-events-none absolute bottom-full z-50 mb-4 flex flex-col items-center transition-opacity
            duration-200
          "
          style={{
            left: safeLeftPos,
            transform: "translateX(-50%)",
          }}
        >
          <SpriteThumbnail sprite={activeSprite} hoverTime={hoverTime} />
          <div
            className="
              mt-1 rounded-sm border border-white/10 bg-black/80 px-4 py-1 text-sm font-medium text-white shadow-sm
            "
          >
            {new Date(hoverTime * 1000).toISOString().slice(14, 19)}
          </div>
        </div>
      ) : null}

      <Slider
        ref={containerRef}
        value={[currentTime]}
        max={duration}
        step={1}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowThumb(false)}
        onValueChange={([value]) => {
          if (!disabled) onValueChange(value);
        }}
        className="z-10 h-8 cursor-pointer data-disabled:cursor-not-allowed data-disabled:opacity-50"
        aria-label={t("seekBar")}
        disabled={disabled}
      />
      <div className="flex items-center justify-between">
        <div className="text-lg font-medium text-white md:text-2xl">
          {currentTimeFormatted}{" "}
          <span className="text-muted-foreground">/ {durationFormatted}</span>
        </div>
        {haveNextEpisode ? (
          <Link
            to="/title/$titleId/watch"
            params={{ titleId }}
            search={{ episodeId: nextEpisodeId }}
            className="
              group/next flex items-center text-lg font-medium text-white/80 duration-200 hover:text-white md:text-2xl
            "
          >
            {t("nextEpisode")}
            <ChevronRight className="ml-1 inline-block size-5 duration-200 group-hover/next:translate-x-1" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
