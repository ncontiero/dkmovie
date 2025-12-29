import type { Episode, TitleDetails } from "@/utils/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Captions,
  ChevronRight,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Settings,
  StepBack,
  StepForward,
  Volume,
  Volume1,
  Volume2,
  VolumeOff,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";
import { Slider } from "../ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface VideoPlayerProps {
  readonly src: string;
  readonly poster?: string;
  readonly className?: string;
  readonly title: TitleDetails;
  readonly episode?: Episode | null;
}

export function VideoPlayer({
  title,
  episode,
  src,
  poster,
  className,
}: VideoPlayerProps) {
  const { isMobile } = useIsMobile();
  const t = useTranslations("playerPage");
  const navigate = useNavigate();
  const [isToShowControls, setIsToShowControls] = useState(false);
  const controlsTimeoutRef = useRef<number | null>(null);
  const [isInFullscreen, setIsInFullscreen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [src]);

  useEffect(() => {
    if (!videoRef.current || !isMobile || !document.fullscreenEnabled) return;
    document.documentElement.requestFullscreen().catch(() => {});
  }, [isMobile]);

  const closePlayer = useCallback(async () => {
    if (videoRef.current && isVideoPlaying) videoRef.current.pause();
    if (document.fullscreenElement) await document.exitFullscreen();

    await navigate({ to: "/title/$titleId", params: { titleId: title.id } });
  }, [isVideoPlaying, navigate, title.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Escape") {
        event.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          closePlayer();
        }
      }

      if (event.code === "Space") {
        event.preventDefault();
        if (!videoRef.current) return;

        if (isVideoPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closePlayer, isVideoPlaying]);

  const handleControlsMouseMove = () => {
    setIsToShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = window.setTimeout(() => {
      setIsToShowControls(false);
    }, 2000);
  };

  const handleControlsMouseLeave = () => {
    setIsToShowControls(false);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsInFullscreen(document.fullscreenElement !== null);
      // Rotate screen on mobile
      try {
        if (!isMobile) return;
        if (document.fullscreenElement) {
          window.screen.orientation.lock("landscape").catch(() => {});
        } else {
          window.screen.orientation.unlock();
        }
      } catch {}
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isMobile]);

  const duration = episode?.duration || title.duration || 0;
  const haveNextEpisode =
    !!episode?.next_episode && episode.next_episode.is_video_available;

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

  if (!title) return null;

  return (
    <div
      className={cn(
        "group flex size-full max-h-screen items-center justify-center",
        className,
      )}
    >
      <div
        className={cn(
          `
            absolute inset-0 z-10 bg-radial from-transparent to-black/90 to-75% px-4 pt-6 opacity-0 duration-200
            md:px-20 md:pt-10
          `,
          isToShowControls && "opacity-100",
        )}
        onMouseMove={handleControlsMouseMove}
        onMouseLeave={handleControlsMouseLeave}
      >
        <div className="absolute inset-0 -z-1 bg-linear-to-b from-black/80 to-transparent to-20%" />
        <div className="absolute inset-0 -z-1 bg-linear-to-t from-black/80 to-transparent to-20%" />

        <div className="flex size-full flex-col">
          <div className="flex w-full items-center justify-end md:justify-between">
            <div className="flex flex-col gap-1 max-md:hidden">
              <h1 className="text-3xl font-bold text-white">{title.title}</h1>
              {episode ? (
                <p className="text-xl text-white/80">
                  {t("episodeDescription", {
                    seasonName: episode.season.name,
                    episodeNumber: episode.number,
                    episodeName: episode.name,
                  })}
                </p>
              ) : null}
            </div>
            <div className="flex h-10 items-center gap-1 md:gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-auto rounded-full p-2 text-white/80 hover:bg-white/40 hover:text-white"
                  >
                    <Captions className="md:size-8" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("captionsAndAudios")}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-auto rounded-full p-2 text-white/80 hover:bg-white/40 hover:text-white"
                  >
                    <Settings className="md:size-8" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("options")}</TooltipContent>
              </Tooltip>
              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-auto rounded-full p-2 text-white/80 hover:bg-white/40 hover:text-white"
                      >
                        {volume > 0.5 ? (
                          <Volume2 className="md:size-8" />
                        ) : volume > 0.3 ? (
                          <Volume1 className="md:size-8" />
                        ) : volume > 0 ? (
                          <Volume className="md:size-8" />
                        ) : (
                          <VolumeOff className="md:size-8" />
                        )}
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>{t("volume")}</TooltipContent>
                </Tooltip>
                <PopoverContent className="w-16">
                  <Slider
                    value={[volume]}
                    max={1}
                    step={0.01}
                    orientation="vertical"
                    className="cursor-pointer"
                    onValueChange={([value]) => {
                      if (videoRef.current) {
                        videoRef.current.volume = value;
                      }
                    }}
                    aria-label={t("volume")}
                  />
                </PopoverContent>
              </Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="
                      size-auto rounded-full p-2 text-white/80 hover:bg-white/40 hover:text-white max-lg:hidden
                    "
                    onClick={() => {
                      if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen();
                      } else {
                        document.exitFullscreen();
                      }
                    }}
                  >
                    {isInFullscreen ? (
                      <Minimize2 className="md:size-8" />
                    ) : (
                      <Maximize2 className="md:size-8" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isInFullscreen ? t("exitFullScreen") : t("fullScreen")}
                </TooltipContent>
              </Tooltip>
              <Separator
                orientation="vertical"
                className="mx-2 bg-white md:mx-4 md:w-1"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-auto rounded-full p-2 text-white/80 hover:bg-white/40 hover:text-white"
                    aria-label={t("close")}
                    onClick={closePlayer}
                  >
                    <X className="md:size-8" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("close")}</TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 flex -translate-1/2 items-center gap-4 md:gap-14">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-auto rounded-full p-4 hover:scale-110 hover:bg-white/40"
                  aria-label={t("seekBack")}
                  onClick={() => {
                    if (!videoRef.current) return;
                    const newTime = videoRef.current.currentTime - 10;
                    videoRef.current.currentTime = Math.max(0, newTime);
                  }}
                >
                  <StepBack className="size-10 fill-white stroke-white md:size-20" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("seekBack")}</TooltipContent>
            </Tooltip>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-auto rounded-full p-4 hover:scale-110 hover:bg-white/40"
              onClick={() => {
                if (!videoRef.current) return;

                if (isVideoPlaying) {
                  videoRef.current.pause();
                } else {
                  videoRef.current.play();
                }
              }}
            >
              {isVideoPlaying ? (
                <Pause className="size-10 fill-white stroke-white md:size-20" />
              ) : (
                <Play className="size-10 fill-white stroke-white md:size-20" />
              )}
              <span className="sr-only">
                {isVideoPlaying ? t("pause") : t("play")}
              </span>
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-auto rounded-full p-4 hover:scale-110 hover:bg-white/40"
                  aria-label={t("seekForward")}
                  onClick={() => {
                    if (!videoRef.current) return;
                    const newTime = videoRef.current.currentTime + 10;
                    videoRef.current.currentTime = Math.min(duration, newTime);
                  }}
                >
                  <StepForward className="size-10 fill-white stroke-white md:size-20" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("seekForward")}</TooltipContent>
            </Tooltip>
          </div>
          <div className="absolute inset-x-6 bottom-6 md:inset-x-20 md:bottom-8">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={([value]) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = value;
                }
              }}
              className="cursor-pointer"
              aria-label={t("seekBar")}
            />
            <div className="flex items-center justify-between pt-4">
              <div className="text-lg font-medium text-white md:text-2xl">
                {currentTimeFormatted}{" "}
                <span className="text-muted-foreground">
                  / {durationFormatted}
                </span>
              </div>
              {haveNextEpisode ? (
                <Link
                  to="/title/$titleId/watch"
                  params={{ titleId: title.id }}
                  search={{ episodeId: episode.next_episode?.id }}
                  className="
                    group/next flex items-center text-lg font-medium text-white/80 duration-200 hover:text-white
                    md:text-2xl
                  "
                >
                  {t("nextEpisode")}
                  <ChevronRight className="ml-1 inline-block size-5 duration-200 group-hover/next:translate-x-1" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <video
        ref={videoRef}
        controls={false}
        autoPlay
        preload="metadata"
        className="size-full max-h-screen"
        poster={poster}
        onPlay={() => setIsVideoPlaying(true)}
        onPause={() => setIsVideoPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onVolumeChange={(e) => setVolume(e.currentTarget.volume)}
        onEnded={() => {
          if (episode && !haveNextEpisode) {
            toast.warning(t("noNextEpisode"));
            navigate({
              to: "/title/$titleId",
              params: { titleId: title.id },
            });
            return;
          }

          navigate({
            to: "/title/$titleId/watch",
            params: { titleId: title.id },
            search: { episodeId: episode?.next_episode?.id },
          });
        }}
      >
        <source src={src} type="video/mp4" />
        {t("browserNotSupported")}
        <track kind="captions" />
      </video>
    </div>
  );
}
