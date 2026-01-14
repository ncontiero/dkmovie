import type {
  Episode,
  HLSApiAudioTrack,
  HLSApiLevelProps,
  HLSApiProps,
  TitleDetails,
} from "@/utils/types";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactPlayer from "react-player";
import { useNavigate } from "@tanstack/react-router";
import {
  Maximize2,
  Minimize2,
  Pause,
  PictureInPicture2,
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
import { releaseSession, sendHeartbeat } from "@/http/concurrency";
import { cn } from "@/lib/utils";
import { Accordion } from "../ui/accordion";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";
import { Slider } from "../ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { AudioOptions } from "./options/audio-options";
import { ResolutionOptions } from "./options/resolution-options";
import { SubtitleOptions } from "./options/subtitle-options";
import { SubtitleOverlay } from "./subtitle-overlay";
import { Timeline } from "./timeline";

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
  const t = useTranslations("playerPage");
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [isToShowControls, setIsToShowControls] = useState(false);
  const controlsTimeoutRef = useRef<number | null>(null);
  const [isInFullscreen, setIsInFullscreen] = useState(false);
  const [isInPictureInPicture, setIsInPictureInPicture] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [resolutionLevels, setResolutionLevels] = useState<number[]>([]);
  const [currentResolution, setCurrentResolution] = useState<number>(-1);
  const [audioTracks, setAudioTracks] = useState<HLSApiAudioTrack[]>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<number>(0);
  const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsApiRef = useRef<HLSApiProps | null>(null);

  const duration = episode?.duration || title.duration || 0;
  const haveNextEpisode =
    !!episode?.next_episode && episode.next_episode.is_video_available;

  const tracks = episode?.tracks || title.tracks;
  const subtitles = tracks.filter((t) => Boolean(t.subtitle_file));

  const currentSubtitleUrl = useMemo(() => {
    const current = subtitles.find((s) => s.language === currentSubtitle);
    if (!current || !current.subtitle_file) return null;
    return current.subtitle_file;
  }, [currentSubtitle, subtitles]);

  const sessionIdRef = useRef<string | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isSessionAllowed, setIsSessionAllowed] = useState(false);

  const releaseCurrentSession = useCallback(async () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    if (!sessionIdRef.current) return;
    try {
      await releaseSession(sessionIdRef.current);
      sessionIdRef.current = null;
    } catch (error) {
      console.error("Failed to release session", error);
    }
  }, []);

  const closePlayer = useCallback(async () => {
    await releaseCurrentSession();
    if (videoRef.current && isVideoPlaying) videoRef.current.pause();
    if (document.fullscreenElement) await document.exitFullscreen();
    await navigate({
      to: "/title/$titleId",
      params: { titleId: title.id },
      replace: true,
    });
  }, [isVideoPlaying, navigate, releaseCurrentSession, title.id]);

  const initSession = useEffectEvent(async () => {
    if (typeof window !== "undefined") {
      const STORAGE_KEY = "stream_session_id";
      let sid = sessionStorage.getItem(STORAGE_KEY);
      if (!sid) {
        sid = crypto.randomUUID();
        sessionStorage.setItem(STORAGE_KEY, sid);
      }
      sessionIdRef.current = sid;
    }

    const sessionId = sessionIdRef.current || "";
    try {
      const { allowed } = await sendHeartbeat(sessionId);
      if (allowed) {
        setIsSessionAllowed(true);
        setVideoSrc(`${src}?session_id=${sessionId}`);

        heartbeatIntervalRef.current = setInterval(async () => {
          if (!sessionIdRef.current) return;
          try {
            const res = await sendHeartbeat(sessionId);
            if (!res.allowed) {
              setIsSessionAllowed(false);
              toast.error(t("screensLimitReached"));
              await closePlayer();
            }
          } catch {}
        }, 30000);
      } else {
        setIsSessionAllowed(false);
        toast.error(t("screensLimitReached"));
        await closePlayer();
      }
    } catch (error) {
      console.error("Failed to init session", error);
      toast.error(t("onError"));
    }
  });

  useEffect(() => {
    initSession();
  }, []);

  useEffect(() => {
    if (!videoRef.current || !isMobile || !document.fullscreenEnabled) return;
    document.documentElement.requestFullscreen().catch(() => {});
  }, [isMobile]);

  const seekForward = useCallback(() => {
    if (!videoRef.current) return;
    const newTime = videoRef.current.currentTime + 10;
    videoRef.current.currentTime = Math.min(duration, newTime);
  }, [duration]);
  const seekBack = useCallback(() => {
    if (!videoRef.current) return;
    const newTime = videoRef.current.currentTime - 10;
    videoRef.current.currentTime = Math.max(0, newTime);
  }, []);

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

      if (event.code === "ArrowRight") {
        event.preventDefault();
        seekForward();
      }

      if (event.code === "ArrowLeft") {
        event.preventDefault();
        seekBack();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closePlayer, isVideoPlaying, seekBack, seekForward]);

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

  const setResolutionLevel = useCallback((resolution: number) => {
    if (!hlsApiRef.current) return;

    const levelIndex = hlsApiRef.current.levels.findIndex(
      (level: HLSApiLevelProps) => level.height === resolution,
    );
    hlsApiRef.current.currentLevel = levelIndex;
    setCurrentResolution(resolution);
  }, []);

  const changeSubtitle = useCallback(
    (language: string | null) => {
      if (language === null) {
        setCurrentSubtitle(null);
        return;
      }

      const selectedSubtitle = subtitles.find((t) => t.language === language);
      if (!selectedSubtitle) return;
      setCurrentSubtitle(language);
    },
    [subtitles],
  );

  const changeAudioTrack = useCallback(
    (track: number) => {
      if (!hlsApiRef.current) return;

      const selectedTrack = audioTracks.find((t) => t.id === track);
      if (!selectedTrack) return;

      hlsApiRef.current.audioTrack = track;
      setCurrentAudioTrack(track);
    },
    [audioTracks],
  );

  if (!title) return null;
  if (!isSessionAllowed && !isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-black text-white">
        <h1 className="text-2xl font-bold">{t("screensLimitReached")}</h1>
        <Button onClick={closePlayer} variant="secondary">
          {t("close")}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex size-full max-h-screen items-center justify-center overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          `
            absolute inset-0 z-10 bg-radial from-transparent to-black/90 to-75% px-4 pt-2 opacity-0 duration-200
            lg:px-20 lg:pt-10
          `,
          isToShowControls && "opacity-100",
        )}
        onMouseMove={handleControlsMouseMove}
        onMouseLeave={handleControlsMouseLeave}
      >
        {/* Controls UI */}
        <div className="absolute inset-0 -z-1 bg-linear-to-b from-black/80 to-transparent to-20%" />
        <div className="absolute inset-0 -z-1 bg-linear-to-t from-black/80 to-transparent to-20%" />

        <div className="flex size-full flex-col">
          <div className="flex w-full items-center justify-end sm:justify-between">
            <div className="flex flex-col gap-1 max-sm:hidden">
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
              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-auto rounded-full p-2 text-white/80 hover:bg-white/40 hover:text-white"
                        disabled={isLoading}
                      >
                        <Settings className="md:size-8" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>{t("options.title")}</TooltipContent>
                </Tooltip>
                <PopoverContent className="w-52 p-1">
                  <Accordion type="single" collapsible className="w-full">
                    <ResolutionOptions
                      resolutionLevels={resolutionLevels}
                      currentResolution={currentResolution}
                      setResolutionLevel={setResolutionLevel}
                    />
                    <SubtitleOptions
                      subtitles={subtitles}
                      changeSubtitle={changeSubtitle}
                      currentSubtitle={currentSubtitle}
                    />
                    <AudioOptions
                      audioTracks={audioTracks}
                      changeAudioTrack={changeAudioTrack}
                      currentAudioTrack={currentAudioTrack}
                    />
                  </Accordion>
                </PopoverContent>
              </Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "size-auto rounded-full p-2 text-white/80 hover:bg-white/40 hover:text-white max-lg:hidden",
                      isInFullscreen && "cursor-not-allowed opacity-50",
                    )}
                    disabled={isLoading}
                    onClick={() => {
                      if (isInFullscreen) return;
                      setIsInPictureInPicture((prev) => !prev);
                    }}
                  >
                    <PictureInPicture2
                      className={cn(
                        "md:size-8",
                        isInPictureInPicture && "fold-bold",
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isInFullscreen
                    ? t("pipDisabledWhenInFullScreen")
                    : isInPictureInPicture
                      ? t("exitPictureInPicture")
                      : t("pictureInPicture")}
                </TooltipContent>
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
                        disabled={isLoading}
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
                    onValueChange={([value]) => setVolume(value)}
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
                    className={cn(
                      "size-auto rounded-full p-2 text-white/80 hover:bg-white/40 hover:text-white max-lg:hidden",
                      isInPictureInPicture && "cursor-not-allowed opacity-50",
                    )}
                    onClick={() => {
                      if (isInPictureInPicture) return;
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
                  {isInPictureInPicture
                    ? t("fullScreenDisabledWhenInPip")
                    : isInFullscreen
                      ? t("exitFullScreen")
                      : t("fullScreen")}
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
                  onClick={seekBack}
                  disabled={isLoading}
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
                videoRef.current.paused
                  ? videoRef.current.play()
                  : videoRef.current.pause();
              }}
              disabled={isLoading}
              loading={isLoading}
              loadingIconClassName="size-10 md:size-20"
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
                  onClick={seekForward}
                  disabled={isLoading}
                >
                  <StepForward className="size-10 fill-white stroke-white md:size-20" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("seekForward")}</TooltipContent>
            </Tooltip>
          </div>
          <Timeline
            sprites={episode?.sprites || title.sprites}
            titleId={title.id}
            nextEpisodeId={episode?.next_episode?.id}
            haveNextEpisode={haveNextEpisode}
            currentTime={currentTime}
            duration={duration}
            onValueChange={(value) => {
              if (videoRef.current) videoRef.current.currentTime = value;
            }}
            disabled={isLoading}
          />
        </div>
      </div>

      {currentSubtitle && currentSubtitleUrl ? (
        <SubtitleOverlay
          currentTime={currentTime}
          url={currentSubtitleUrl}
          className={cn(
            "inset-x-6 bottom-2 duration-200 lg:inset-x-20 lg:bottom-12",
            isToShowControls && "-translate-y-12 lg:-translate-y-14",
          )}
        />
      ) : null}
      <ReactPlayer
        ref={videoRef}
        width="100%"
        height="100%"
        className="size-full min-h-screen min-w-screen"
        src={videoSrc || undefined}
        controls={false}
        playsInline
        autoPlay
        poster={poster}
        onError={async (e) => {
          console.error(e);
          toast.error(t("onError"));
          await closePlayer();
        }}
        onCanPlay={(e) => {
          const hlsApi = (e.target as any).api as HLSApiProps;
          if (hlsApi) {
            hlsApiRef.current = hlsApi;
            setAudioTracks(hlsApi.audioTracks || []);
            setCurrentAudioTrack(hlsApi.audioTrack || 0);

            const levels = hlsApi.levels;
            if (!levels) return;
            const heights = Array.from(
              new Set<number>(levels.map((l: HLSApiLevelProps) => l.height)),
            ).sort((a, b) => b - a);
            setResolutionLevels(heights);
          }

          setIsLoading(false);
        }}
        pip={isInPictureInPicture}
        onLeavePictureInPicture={() => setIsInPictureInPicture(false)}
        volume={volume}
        onPlay={() => setIsVideoPlaying(true)}
        onPause={() => setIsVideoPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => {
          if (episode && !haveNextEpisode) {
            toast.warning(t("noNextEpisode"));
            closePlayer();
            return;
          }

          navigate({
            to: "/title/$titleId/watch",
            params: { titleId: title.id },
            search: { episodeId: episode?.next_episode?.id },
          });
        }}
        crossOrigin="anonymous"
      />
    </div>
  );
}
