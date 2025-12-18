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
import { getSeasonEpisodes } from "@/http/get-episodes";
import { cn } from "@/lib/utils";

interface EpisodeCardProps {
  readonly episode: Episode;
  readonly titleId: string;
}

function EpisodeCard({ episode, titleId }: EpisodeCardProps) {
  const { lang } = useIntl();

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
    const hours = Math.floor(episode.duration / 60);
    const hoursFormatted = hours > 0 ? `${hours}h ` : "";
    const minutes = episode.duration % 60;
    return `${hoursFormatted}${minutes}m`;
  }, [episode]);

  return (
    <Link
      to="/title/$titleId/watch"
      params={{ titleId }}
      className="
        group ring-ring hover:bg-secondary ring-offset-background focus-visible:bg-secondary h-40 rounded-lg border
        ring-offset-2 duration-200 hover:-translate-y-1 hover:scale-101 focus-visible:ring-2
        focus-visible:outline-hidden
      "
    >
      <div className="flex size-full gap-4">
        <div className="group/image relative h-full min-w-64 overflow-hidden rounded-lg rounded-r-none">
          {episode.still ? (
            <img
              src={episode.still}
              alt={episode.name}
              className="
                h-full w-64 rounded-lg rounded-r-none object-cover object-center duration-200 group-hover:scale-110
              "
            />
          ) : (
            <div className="to-primary/40 size-full rounded-lg rounded-r-none bg-linear-to-bl from-transparent" />
          )}
          <div
            className="
              bg-foreground absolute top-1/2 left-1/2 -translate-1/2 rounded-full p-2 opacity-0 duration-200
              group-hover:opacity-100 group-hover/image:scale-110 group-focus-visible:opacity-100
            "
          >
            <Play className="fill-background size-8" />
          </div>
        </div>
        <div className="flex flex-col py-4">
          <div className="flex flex-col">
            <h3 className="text-start text-xl font-medium">
              {episode.number}
              <span className="mx-1">•</span>
              {episode.name}
            </h3>
            <div className="text-muted-foreground mt-1 flex items-center text-sm">
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
          group hover:bg-secondary ring-offset-background focus-visible:ring-ring h-40 overflow-hidden rounded-t-lg
          border py-0 ring-offset-2 duration-200 hover:no-underline focus-visible:ring-2 focus-visible:outline-hidden
          data-[state=closed]:rounded-lg
        "
        asHeader="div"
        hiddenIcon
      >
        <div className="flex size-full gap-4">
          <div className="h-full min-w-32">
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
                  to-primary/40 size-full rounded-t-lg bg-linear-to-bl from-transparent
                  group-data-[state=closed]:rounded-lg
                "
              />
            )}
          </div>
          <div className="flex flex-col py-4 duration-200 group-data-[state=open]:translate-y-[20%]">
            <div className="flex flex-col">
              <h3 className="text-start text-xl font-medium">{season.name}</h3>
              <div className="text-muted-foreground mt-0.5 flex items-center text-sm">
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
                  `mt-4 line-clamp-2 text-start font-normal opacity-100 duration-200 group-data-[state=open]:hidden`,
                  haveOverview && "max-w-[80%]",
                )}
              >
                {overview}
              </p>
            </div>
          </div>
        </div>
        <ChevronDown className="mr-8 size-6 shrink-0 duration-200" />
      </AccordionTrigger>
      <AccordionContent className="rounded-b-lg border-x border-b p-4 duration-1000">
        <p className="text-foreground/80 max-w-[80%] text-base">{overview}</p>
        <div className="flex flex-col gap-4 py-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  className="flex size-full h-40 w-full gap-4 rounded-lg"
                >
                  <Skeleton className="bg-background h-full min-w-64 rounded-lg rounded-r-none" />
                  <div className="flex w-full flex-col gap-1 py-4">
                    <Skeleton className="bg-background h-7 w-52" />
                    <Skeleton className="bg-background h-5 w-52" />
                    <Skeleton className="bg-background mt-4 h-6 w-[90%]" />
                    <Skeleton className="bg-background mt-0.5 h-6 w-1/2" />
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
