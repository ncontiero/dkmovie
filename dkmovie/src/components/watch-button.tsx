import type { Title } from "@/utils/types";
import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { useTranslations } from "use-intl";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface WatchButtonProps {
  readonly title: Title;
  readonly variant?: "small" | "large";
}

export function WatchButton({ title, variant = "large" }: WatchButtonProps) {
  const t = useTranslations("watchButton");
  const commonT = useTranslations("common");
  const { user } = useSession();

  const historyTitleEntry = useMemo(() => {
    if (!user) return null;
    return user.history.find((entry) => entry.title === title.id);
  }, [title.id, user]);

  const watchButtonText = useMemo(() => {
    if (!historyTitleEntry) return t("watch");
    const ep = historyTitleEntry.episode;
    if (ep) {
      return t("continueWatchingEpisode", {
        seasonNumber: ep.season_number,
        episodeNumber: ep.episode_number,
      });
    }
    return t("continue");
  }, [historyTitleEntry, t]);

  const watchButtonLabel = useMemo(() => {
    if (!historyTitleEntry) return t("watchTitle", { title: title.title });
    const ep = historyTitleEntry.episode;
    if (ep) {
      return t("continueWatchingEpisodeTitle", {
        title: title.title,
        seasonNumber: ep.season_number,
        episodeNumber: ep.episode_number,
      });
    }
    return t("continueWatchingTitle", { title: title.title });
  }, [historyTitleEntry, t, title.title]);

  return (
    <Button
      type="button"
      size={variant === "large" ? "lg" : "sm"}
      className={cn(
        "w-full",
        variant === "large"
          ? `h-12 px-8 text-base font-semibold shadow-xl shadow-primary/20 hover:scale-105 hover:shadow-primary/40 xs:w-auto`
          : "z-20 h-8 gap-1",
      )}
      asChild={title.is_video_available}
      disabled={!title.is_video_available}
    >
      {title.is_video_available ? (
        <Link
          to="/title/$titleId/watch"
          params={{ titleId: title.id }}
          search={{
            episodeId:
              historyTitleEntry?.episode?.id ||
              title.first_episode_id ||
              undefined,
          }}
          title={watchButtonLabel}
          aria-label={watchButtonLabel}
        >
          <Play
            className={cn(
              "fill-primary-foreground",
              variant === "large" ? "size-5" : "",
            )}
          />
          {watchButtonText}
        </Link>
      ) : (
        <>
          <Play
            className={cn(
              "fill-primary-foreground",
              variant === "large" ? "size-5" : "",
            )}
          />
          {commonT("notAvailable")}
        </>
      )}
    </Button>
  );
}
