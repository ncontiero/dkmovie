import type { Episode, Season } from "@/utils/types";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Play, Star } from "lucide-react";
import { useTranslations } from "use-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useIntl } from "@/hooks/use-intl";
import { useSession } from "@/hooks/use-session";
import { getSeasonEpisodes } from "@/http/get-episodes";
import { cn } from "@/lib/utils";

interface EpisodeCardProps {
  readonly episode: Episode;
  readonly titleId: string;
}

function EpisodeCard({ episode, titleId }: EpisodeCardProps) {
  const { lang } = useIntl();
  const commonT = useTranslations("common");
  const { isAuthenticated, user } = useSession();

  const releaseDate = useMemo(() => {
    if (!episode.air_date) return null;
    return new Date(episode.air_date).toLocaleString(lang, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, [episode, lang]);

  const durationFormatted = useMemo(() => {
    if (!episode || !episode.duration || episode.duration === 0) return "0m";
    const { duration } = episode;
    const hours = Math.floor(duration / 3600);
    const hoursFormatted = hours > 0 ? `${hours}h ` : "";
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hoursFormatted}${minutes}m`;
  }, [episode]);

  const watchedPercentage = useMemo(() => {
    if (!isAuthenticated || !user) return 0;
    if (!episode.duration || episode.duration === 0) return 0;

    const watchedEpisode = user.history.find(
      (entry) => entry.episode?.id === episode.id,
    );
    const watchedSeconds = watchedEpisode ? watchedEpisode.watched_seconds : 0;
    if (watchedSeconds === 0) return 0;

    return Math.min((watchedSeconds / episode.duration) * 100, 100);
  }, [episode.duration, episode.id, isAuthenticated, user]);

  return (
    <Link
      to="/title/$titleId/watch"
      params={{ titleId }}
      search={{ episodeId: episode.id }}
      className="
        group overflow-hidden rounded-lg ring-ring ring-offset-2 ring-offset-background duration-200 hover:scale-101
        hover:bg-secondary hover:p-2 focus-visible:bg-secondary focus-visible:ring-2 focus-visible:outline-hidden
        aria-disabled:cursor-not-allowed aria-disabled:opacity-50 max-lg:border-y max-lg:pb-4
      "
      disabled={!episode.is_video_available}
      title={!episode.is_video_available ? commonT("notAvailable") : undefined}
    >
      <div className="flex size-full flex-col gap-4 lg:flex-row">
        <div
          className="
            group/image relative h-[calc(100vw/16*9)] w-full overflow-hidden lg:h-full lg:max-w-64 lg:min-w-64 lg:rounded-lg
          "
        >
          {episode.still ? (
            <img
              src={episode.still}
              alt={episode.name}
              className="
                size-full object-cover object-center duration-200 group-hover:scale-110 lg:max-w-64 lg:min-w-64 lg:rounded-lg
              "
            />
          ) : (
            <div className="size-full bg-linear-to-bl from-transparent to-primary/40 lg:rounded-lg lg:rounded-r-none" />
          )}
          {watchedPercentage > 0 ? (
            <div
              className="
                absolute inset-x-0 bottom-0 h-2.5 bg-secondary duration-200 group-hover:inset-x-2 group-hover:-translate-y-2
                lg:group-hover:rounded-lg lg:group-focus-visible:inset-x-2 lg:group-focus-visible:-translate-y-2
                lg:group-focus-visible:rounded-lg
              "
            >
              <div
                className="size-full bg-primary duration-200 lg:group-hover:rounded-lg lg:group-focus-visible:rounded-lg"
                style={{
                  width: `${watchedPercentage}%`,
                }}
              />
            </div>
          ) : null}
          <div
            className={cn(
              `
                absolute top-1/2 left-1/2 -translate-1/2 rounded-full p-2 opacity-0 duration-200 group-hover:opacity-100
                group-hover/image:scale-110 group-focus-visible:opacity-100
              `,
              episode.is_video_available
                ? `bg-foreground`
                : "bg-background opacity-100",
            )}
          >
            {episode.is_video_available ? (
              <Play className="size-8 fill-background" />
            ) : (
              <p className="text-foreground">{commonT("notAvailable")}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col max-lg:px-2">
          <div className="flex flex-col">
            <h3 className="text-start text-xl font-medium">
              {episode.number}
              <span className="mx-1">•</span>
              {episode.name}
            </h3>
            <div className="mt-1 flex items-center text-sm text-muted-foreground">
              <span
                className={`
                  mr-2 flex items-center gap-1 rounded-md bg-yellow-500/10 px-2 py-0.5 text-yellow-500 ring-1
                  ring-yellow-500/20 ring-inset
                `}
              >
                <Star className="size-3.5 fill-current" />
                {episode.rating}
              </span>
              {episode.air_date ? (
                <>
                  <p>{releaseDate}</p>
                  <span className="mx-2">•</span>
                </>
              ) : null}
              <p />
              <p>{durationFormatted}</p>
            </div>
            <p className="mt-4">{episode.overview}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface SeasonCardProps {
  readonly season: Season;
  readonly titleId: string;
  readonly selectedSeason?: string;
}

export function SeasonCard({
  titleId,
  season,
  selectedSeason,
}: SeasonCardProps) {
  const t = useTranslations("titlePage");

  const haveOverview = season.overview.length > 0;
  const overview = haveOverview ? season.overview : t("seasonWithoutSynopsis");

  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ["content", "title", titleId, "seasonEpisodes", season.number],
    queryFn: () => getSeasonEpisodes(titleId, season.number),
    staleTime: 1000 * 60 * 60,
    enabled: selectedSeason === season.id && season.episode_count > 0,
    retry: false,
  });

  return (
    <AccordionItem value={season.id} className="border-0">
      <AccordionTrigger
        className="
          group h-40 overflow-hidden rounded-t-lg border py-0 ring-offset-2 ring-offset-background duration-200
          hover:bg-secondary hover:no-underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden
          data-[state=closed]:rounded-lg
        "
        asHeader="div"
        hiddenIcon
      >
        <div className="flex size-full gap-3">
          <div className="size-full max-w-25 min-w-25">
            {season.poster ? (
              <img
                src={season.poster}
                alt={season.name}
                className="
                  size-full rounded-t-lg object-cover object-center duration-200 group-data-[state=closed]:rounded-lg
                "
              />
            ) : (
              <div
                className="
                  size-full rounded-t-lg bg-linear-to-bl from-transparent to-primary/40 group-data-[state=closed]:rounded-lg
                "
              />
            )}
          </div>
          <div className="flex flex-col py-4 duration-200 group-data-[state=open]:translate-y-[20%] max-sm:translate-y-[20%]">
            <div className="flex flex-col">
              <h3 className="text-start text-xl font-medium">{season.name}</h3>
              <div className="mt-0.5 flex items-center text-sm text-muted-foreground">
                <span
                  className={`
                    mr-2 flex items-center gap-1 rounded-md bg-yellow-500/10 px-2 py-0.5 text-yellow-500 ring-1
                    ring-yellow-500/20 ring-inset
                  `}
                >
                  <Star className="size-3.5 fill-current" />
                  {season.rating}
                </span>
                {season.air_date ? (
                  <>
                    <p>{new Date(season.air_date).getFullYear()}</p>
                    <span className="mx-2">•</span>
                  </>
                ) : null}
                <p>
                  {t("episodeCount", {
                    count: season.episode_count,
                  })}
                </p>
              </div>
              <p
                className={cn(
                  `
                    mt-4 line-clamp-2 text-start font-normal opacity-100 duration-200 group-data-[state=open]:hidden
                    max-sm:hidden
                  `,
                  haveOverview && "sm:max-w-[80%]",
                )}
              >
                {overview}
              </p>
            </div>
          </div>
        </div>
        <ChevronDown className="mr-4 size-6 shrink-0 duration-200 sm:mr-8" />
      </AccordionTrigger>
      <AccordionContent className="rounded-b-lg border-x border-b py-4 duration-1000 lg:p-4">
        <p className="text-base text-foreground/80 max-lg:px-4 lg:max-w-[80%]">
          {overview}
        </p>
        <div className="flex flex-col gap-8 py-6 lg:gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  className="flex size-full h-40 w-full gap-4 rounded-lg"
                >
                  <Skeleton className="h-full min-w-64 rounded-lg rounded-r-none bg-background" />
                  <div className="flex w-full flex-col gap-1 py-4">
                    <Skeleton className="h-7 w-52 bg-background" />
                    <Skeleton className="h-5 w-52 bg-background" />
                    <Skeleton className="mt-4 h-6 w-[90%] bg-background" />
                    <Skeleton className="mt-0.5 h-6 w-1/2 bg-background" />
                  </div>
                </Skeleton>
              ))
            : null}
          {episodes.map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} titleId={titleId} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
