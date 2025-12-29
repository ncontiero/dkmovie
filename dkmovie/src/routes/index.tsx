import { useMemo } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslations } from "use-intl";
import { AnimatedRoute } from "@/components/animated-route";
import {
  CarouselSkeleton,
  ContentCarousel,
} from "@/components/content-carousel";
import { HeroSection, HeroSectionSkeleton } from "@/components/hero-section";
import { getTitles } from "@/http/get-titles";
import { generateMetadata } from "@/utils/metadata";
import { getPopularMoviesOrSeriesQueryOptions } from "@/utils/query-options/titles";

const recentlyReleasedQueryOptions = queryOptions({
  queryKey: ["content", "recentlyReleased"],
  queryFn: () => getTitles(),
  staleTime: 1000 * 60 * 60,
});

const popularMoviesQueryOptions = getPopularMoviesOrSeriesQueryOptions("MOVIE");
const popularSeriesQueryOptions =
  getPopularMoviesOrSeriesQueryOptions("SERIES");

export const Route = createFileRoute("/")({
  component: HomeComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(recentlyReleasedQueryOptions);
    queryClient.ensureQueryData(popularMoviesQueryOptions);
    queryClient.ensureQueryData(popularSeriesQueryOptions);
  },
  head: ({
    match: {
      context: { metadataTranslations },
    },
  }) => generateMetadata({ metadataTranslations, overrideTitle: true }),
  pendingComponent: () => (
    <AnimatedRoute>
      <main className="min-h-screen">
        <HeroSectionSkeleton />
        <div className="relative z-20">
          <CarouselSkeleton />
          <CarouselSkeleton />
        </div>
      </main>
    </AnimatedRoute>
  ),
});

function HomeComponent() {
  const t = useTranslations("homePage");

  const { data: recentlyReleased } = useSuspenseQuery(
    recentlyReleasedQueryOptions,
  );
  const { data: movies } = useSuspenseQuery(popularMoviesQueryOptions);
  const { data: series } = useSuspenseQuery(popularSeriesQueryOptions);

  const heroSectionTitles = useMemo(() => {
    const titles = [...recentlyReleased, ...movies, ...series];
    return titles
      .filter((title, index) => {
        return titles.findIndex((t) => t.id === title.id) === index;
      })
      .slice(0, 5);
  }, [movies, recentlyReleased, series]);

  if (
    recentlyReleased.length === 0 &&
    movies.length === 0 &&
    series.length === 0
  ) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2">
        <h1 className="text-center text-2xl font-semibold">{t("noTitles")}</h1>
        <p className="text-muted-foreground text-center">{t("checkLater")}</p>
      </main>
    );
  }

  return (
    <AnimatedRoute>
      <main>
        <HeroSection content={heroSectionTitles} />
        <div className="relative z-20">
          <ContentCarousel title={t("trending")} items={movies} />
          <ContentCarousel title={t("popularSeries")} items={series} />
          <ContentCarousel
            title={t("recentlyReleased")}
            items={recentlyReleased}
          />
        </div>
      </main>
    </AnimatedRoute>
  );
}
