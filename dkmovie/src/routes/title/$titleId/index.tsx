import { useMemo, useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  isNotFound,
  Link,
  notFound,
} from "@tanstack/react-router";
import { Play, Plus, Star } from "lucide-react";
import { useTranslations } from "use-intl";
import { AnimatedRoute } from "@/components/animated-route";
import { ContentCarousel } from "@/components/content-carousel";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link as StyledLink } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import { getTitle, getTitles } from "@/http/get-titles";
import { titleIdSchema } from "@/schemas/routes/title";
import { isHttpNotFound } from "@/utils/errors";
import { generateMetadata } from "@/utils/metadata";
import { SeasonCard } from "./-season-card";

function titleQueryOptions(titleId: string) {
  return queryOptions({
    queryKey: ["content", "title", titleId],
    queryFn: () => getTitle(titleId),
    staleTime: 1000 * 60 * 60,
    retry: false,
  });
}
function titleRelatedTitlesQueryOptions(titleId: string) {
  return queryOptions({
    queryKey: ["content", "relatedMovies", titleId],
    queryFn: () => getTitles({ exclude: titleId }),
    staleTime: 1000 * 60 * 60,
  });
}

export const Route = createFileRoute("/title/$titleId/")({
  component: TitleComponent,
  params: {
    parse: ({ titleId }) => ({ titleId: titleIdSchema.parse(titleId) }),
  },
  loader: async ({ context: { queryClient }, params: { titleId } }) => {
    try {
      const title = await queryClient.ensureQueryData(
        titleQueryOptions(titleId),
      );
      queryClient.ensureQueryData(titleRelatedTitlesQueryOptions(titleId));
      return title;
    } catch (error) {
      if (isHttpNotFound(error)) throw notFound();
      throw error;
    }
  },
  head: ({
    match: {
      context: { metadataTranslations },
      error,
    },
    loaderData: data,
  }) =>
    generateMetadata({
      metadataTranslations,
      title: data?.title || metadataTranslations("errors.NotFound"),
      description: data?.description,
      image: data?.cover ?? undefined,
      imageAlt: data?.title,
      isOnlyBase: isNotFound(error),
    }),
  pendingComponent: () => (
    <AnimatedRoute>
      <Skeleton className="min-h-screen">
        <div className="relative h-[70vh] w-full md:h-[80vh]">
          <div className="relative z-10 flex h-full flex-col justify-end">
            <div className="container mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
              <div className="max-w-3xl space-y-4">
                <Skeleton className="bg-background h-10 w-3/4 sm:h-12 lg:h-14" />
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <Skeleton className="bg-background h-6 w-16" />
                  <Skeleton className="bg-background h-6 w-20" />
                  <Skeleton className="bg-background h-6 w-12" />
                </div>
                <div className="hidden space-y-2 pt-2 md:block">
                  <Skeleton className="bg-background h-6 w-full" />
                  <Skeleton className="bg-background h-6 w-full" />
                  <Skeleton className="bg-background h-6 w-2/3" />
                </div>
                <div className="flex gap-4 pt-4">
                  <Skeleton className="bg-background h-12 w-36" />
                  <Skeleton className="bg-background h-12 w-36" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
          <div className="mb-6 space-y-2 md:hidden">
            <Skeleton className="bg-background h-5 w-full" />
            <Skeleton className="bg-background h-5 w-full" />
            <Skeleton className="bg-background h-5 w-2/3" />
          </div>
          <Skeleton className="bg-background mb-6 h-8 w-1/3" />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="space-y-3 md:col-span-2">
              <Skeleton className="bg-background mb-3 h-6 w-1/4" />
              <Skeleton className="bg-background h-4 w-1/2" />
              <Skeleton className="bg-background h-4 w-1/2" />
              <Skeleton className="bg-background h-4 w-1/2" />
            </div>
            <div className="space-y-3">
              <div className="bg-muted mb-3 h-6 w-1/3 rounded-md" />
              <div className="bg-muted h-4 w-1/2 rounded-md" />
            </div>
          </div>
        </div>
      </Skeleton>
    </AnimatedRoute>
  ),
});

function TitleComponent() {
  const { titleId } = Route.useParams();
  const { data: title } = useSuspenseQuery(titleQueryOptions(titleId));
  const { data: relatedMovies } = useSuspenseQuery(
    titleRelatedTitlesQueryOptions(titleId),
  );
  const [selectedSeason, setSelectedSeason] = useState<string>();

  const commonT = useTranslations("common");
  const t = useTranslations("titlePage");

  const durationFormatted = useMemo(() => {
    if (!title || !title.duration) return null;
    const hours = Math.floor(title.duration / 60);
    const minutes = title.duration % 60;
    return `${hours}h ${minutes}m`;
  }, [title]);

  const titleReleaseYear = title.release_date
    ? new Date(title.release_date).getFullYear()
    : null;

  const noSynopsis =
    title.content_type === "MOVIE"
      ? t("movieWithoutSynopsis")
      : t("seriesWithoutSynopsis");
  const description =
    title.description.length === 0 ? noSynopsis : title.description;

  return (
    <AnimatedRoute>
      <div className="bg-background text-foreground min-h-screen">
        <main>
          <div className="relative h-[75vh] w-full overflow-hidden md:h-[85vh]">
            <div className="absolute inset-0 size-full">
              {title.cover ? (
                <div className="animate-in fade-in size-full duration-1000">
                  <img
                    src={title.cover}
                    alt={title.title}
                    className="size-full object-cover object-top md:object-center"
                    loading="eager"
                  />
                </div>
              ) : (
                <div className="from-primary/20 size-full bg-linear-to-bl to-black" />
              )}
            </div>

            <div className="from-background via-background/60 absolute inset-0 bg-linear-to-t to-transparent md:hidden" />

            <div
              className={`
                md:from-background md:via-background/50 hidden md:absolute md:inset-0 md:block md:bg-linear-to-r
                md:to-transparent
              `}
            />

            <div className="via-background/30 from-background absolute inset-0 bg-linear-to-t to-transparent" />

            <div className="relative z-10 flex h-full flex-col justify-end pb-12 md:pb-16">
              <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="animate-in fade-in slide-in-from-bottom-8 fill-mode-both max-w-3xl duration-1000">
                  <h1
                    className={`
                      text-foreground text-4xl font-black tracking-tight text-balance drop-shadow-2xl sm:text-4xl
                      lg:text-5xl
                    `}
                  >
                    {title.title}
                  </h1>

                  <div
                    className={`
                      text-muted-foreground mt-4 flex flex-wrap items-center gap-3 text-sm font-medium sm:text-base
                    `}
                  >
                    <span
                      className={`
                        flex items-center gap-1 rounded-md bg-yellow-500/10 px-2 py-0.5 text-yellow-500 ring-1
                        ring-yellow-500/20 ring-inset
                      `}
                    >
                      <Star className="size-3.5 fill-current" />
                      {title.rating}
                    </span>

                    {titleReleaseYear ? (
                      <>
                        <span className="text-muted-foreground/40">•</span>
                        <StyledLink
                          to="/search"
                          search={{ releaseYear: titleReleaseYear }}
                          variant="muted"
                          className="hover:text-foreground transition-colors"
                          aria-label={t("seeMoreTitlesOfTheYear", {
                            year: titleReleaseYear,
                          })}
                        >
                          {titleReleaseYear}
                        </StyledLink>
                      </>
                    ) : null}

                    {durationFormatted ? (
                      <>
                        <span className="text-muted-foreground/40">•</span>
                        <span>{durationFormatted}</span>
                      </>
                    ) : title.content_type === "SERIES" ? (
                      <>
                        <span className="text-muted-foreground/40">•</span>
                        <span>
                          {t("seasonsCount", {
                            count: title.seasons?.length || 0,
                          })}
                        </span>
                      </>
                    ) : null}

                    {title.genres?.length > 0 && (
                      <>
                        <span className="text-muted-foreground/40 hidden sm:inline-block">
                          •
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {title.genres.slice(0, 3).map((genre) => (
                            <StyledLink
                              key={genre.slug}
                              to="/search"
                              search={{ genre: genre.name }}
                              variant="muted"
                              className="hover:text-primary transition-colors"
                              aria-label={t("seeMoreTitlesOfTheGenre", {
                                genre: genre.name,
                              })}
                            >
                              {genre.name}
                            </StyledLink>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <p
                    className={`
                      text-foreground/80 mt-6 line-clamp-3 hidden max-w-2xl text-lg leading-relaxed drop-shadow-md
                      md:line-clamp-4
                    `}
                  >
                    {description}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Button
                      size="lg"
                      className={`
                        shadow-primary/20 xs:w-auto hover:shadow-primary/40 h-12 w-full px-8 text-base font-semibold
                        shadow-xl hover:scale-105
                      `}
                      asChild={title.is_video_available}
                      disabled={!title.is_video_available}
                    >
                      {title.is_video_available ? (
                        <Link
                          to="/title/$titleId/watch"
                          params={{ titleId }}
                          search={{
                            episodeId: title.first_episode_id || undefined,
                          }}
                        >
                          <Play className="size-5 fill-current" />
                          {t("watch")}
                        </Link>
                      ) : (
                        <>
                          <Play className="size-5 fill-current" />
                          {commonT("notAvailable")}
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="xs:w-auto h-12 w-full px-6 backdrop-blur-md hover:scale-105"
                    >
                      <Plus className="size-5" />
                      {t("myList")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
            <div>
              <h2 className="text-foreground mb-6 text-3xl font-semibold tracking-tight">
                {t("details")}
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-muted-foreground mb-2 text-sm font-medium tracking-wider uppercase">
                    {t("fullSynopsis")}
                  </h3>
                  <p className="text-foreground/80 text-lg leading-relaxed">
                    {description}
                  </p>
                </div>

                <div>
                  <h3 className="text-muted-foreground mb-2 text-sm font-medium tracking-wider uppercase">
                    {t("cast")}
                  </h3>
                  <p className="text-foreground/80 text-lg">{title.cast}</p>
                </div>
              </div>
            </div>

            {title.seasons?.length > 0 ? (
              <div className="mt-6">
                <h2 className="text-foreground mb-6 text-3xl font-semibold tracking-tight">
                  {t("seasons")}
                </h2>

                <Accordion
                  type="single"
                  collapsible
                  className="flex flex-col gap-4"
                  value={selectedSeason}
                  onValueChange={setSelectedSeason}
                >
                  {title.seasons.map((season) => (
                    <SeasonCard
                      key={season.id}
                      titleId={titleId}
                      season={season}
                      selectedSeason={selectedSeason}
                    />
                  ))}
                </Accordion>
              </div>
            ) : null}
          </div>

          <div className="border-border/50 mt-12 border-t pt-12">
            <ContentCarousel title={t("moreLikeThis")} items={relatedMovies} />
          </div>
        </main>
      </div>
    </AnimatedRoute>
  );
}
