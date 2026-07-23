import { useMemo, useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, isNotFound, notFound } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useTranslations } from "use-intl";
import { AnimatedRoute } from "@/components/animated-route";
import { ContentCarousel } from "@/components/content-carousel";
import { MyListButton } from "@/components/my-list-button";
import { Accordion } from "@/components/ui/accordion";
import { Link as StyledLink } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import { WatchButton } from "@/components/watch-button";
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
                <Skeleton className="h-10 w-3/4 bg-background sm:h-12 lg:h-14" />
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <Skeleton className="h-6 w-16 bg-background" />
                  <Skeleton className="h-6 w-20 bg-background" />
                  <Skeleton className="h-6 w-12 bg-background" />
                </div>
                <div className="hidden space-y-2 pt-2 md:block">
                  <Skeleton className="h-6 w-full bg-background" />
                  <Skeleton className="h-6 w-full bg-background" />
                  <Skeleton className="h-6 w-2/3 bg-background" />
                </div>
                <div className="flex gap-4 pt-4">
                  <Skeleton className="h-12 w-36 bg-background" />
                  <Skeleton className="h-12 w-36 bg-background" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
          <div className="mb-6 space-y-2 md:hidden">
            <Skeleton className="h-5 w-full bg-background" />
            <Skeleton className="h-5 w-full bg-background" />
            <Skeleton className="h-5 w-2/3 bg-background" />
          </div>
          <Skeleton className="mb-6 h-8 w-1/3 bg-background" />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="space-y-3 md:col-span-2">
              <Skeleton className="mb-3 h-6 w-1/4 bg-background" />
              <Skeleton className="h-4 w-1/2 bg-background" />
              <Skeleton className="h-4 w-1/2 bg-background" />
              <Skeleton className="h-4 w-1/2 bg-background" />
            </div>
            <div className="space-y-3">
              <div className="mb-3 h-6 w-1/3 rounded-md bg-muted" />
              <div className="h-4 w-1/2 rounded-md bg-muted" />
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

  const t = useTranslations("titlePage");

  const durationFormatted = useMemo(() => {
    if (!title || !title.duration) return null;
    const hours = Math.floor(title.duration / 3600);
    const minutes = Math.floor((title.duration % 3600) / 60);
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
      <div className="min-h-screen bg-background text-foreground">
        <main>
          <div className="relative h-[75vh] w-full overflow-hidden md:h-[85vh]">
            <div className="absolute inset-0 size-full">
              {title.cover ? (
                <div className="size-full animate-in duration-1000 fade-in">
                  <img
                    src={title.cover}
                    alt={title.title}
                    className="size-full object-cover object-top md:object-center"
                    loading="eager"
                  />
                </div>
              ) : (
                <div className="size-full bg-linear-to-bl from-primary/20 to-black" />
              )}
            </div>

            <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent md:hidden" />

            <div
              className={`
                hidden md:absolute md:inset-0 md:block md:bg-linear-to-r md:from-background md:via-background/50
                md:to-transparent
              `}
            />

            <div className="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent" />

            <div className="relative z-10 flex h-full flex-col justify-end pb-12 md:pb-16">
              <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl animate-in duration-1000 fill-mode-both fade-in slide-in-from-bottom-8">
                  <h1
                    className={`
                      text-4xl font-black tracking-tight text-balance text-foreground drop-shadow-2xl sm:text-4xl lg:text-5xl
                    `}
                  >
                    {title.title}
                  </h1>

                  <div
                    className={`
                      mt-4 flex flex-wrap items-center gap-3 text-sm font-medium text-muted-foreground sm:text-base
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
                          className="transition-colors hover:text-foreground"
                          aria-label={t("seeMoreTitlesOfTheYear", {
                            year: titleReleaseYear,
                          })}
                        >
                          {titleReleaseYear}
                        </StyledLink>
                      </>
                    ) : null}

                    {title.content_type === "SERIES" ? (
                      <>
                        <span className="text-muted-foreground/40">•</span>
                        <span>
                          {t("seasonsCount", {
                            count: title.seasons?.length || 0,
                          })}
                        </span>
                      </>
                    ) : durationFormatted ? (
                      <>
                        <span className="text-muted-foreground/40">•</span>
                        <span>{durationFormatted}</span>
                      </>
                    ) : null}

                    {title.genres?.length > 0 && (
                      <>
                        <span className="hidden text-muted-foreground/40 sm:inline-block">
                          •
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {title.genres.slice(0, 3).map((genre) => (
                            <StyledLink
                              key={genre.slug}
                              to="/search"
                              search={{ genre: genre.name }}
                              variant="muted"
                              className="transition-colors hover:text-primary"
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
                      mt-6 line-clamp-3 hidden max-w-2xl text-lg/relaxed text-foreground/80 drop-shadow-md md:line-clamp-4
                    `}
                  >
                    {description}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <WatchButton title={title} />

                    <MyListButton
                      titleId={titleId}
                      variant="outline"
                      size="lg"
                      className="h-12 w-full px-6 backdrop-blur-md hover:scale-105 xs:w-auto"
                      iconClassName="size-5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
            <div>
              <h2 className="mb-6 text-3xl font-semibold tracking-tight text-foreground">
                {t("details")}
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                    {t("fullSynopsis")}
                  </h3>
                  <p className="text-lg/relaxed text-foreground/80">
                    {description}
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                    {t("cast")}
                  </h3>
                  <p className="text-lg text-foreground/80">{title.cast}</p>
                </div>
              </div>
            </div>

            {title.seasons?.length > 0 ? (
              <div className="mt-6">
                <h2 className="mb-6 text-3xl font-semibold tracking-tight text-foreground">
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

          <div className="mt-12 border-t border-border/50 pt-12">
            <ContentCarousel title={t("moreLikeThis")} items={relatedMovies} />
          </div>
        </main>
      </div>
    </AnimatedRoute>
  );
}
