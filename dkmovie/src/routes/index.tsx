import type { ContentsType } from "@/utils/types";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslations } from "use-intl";
import {
  CarouselSkeleton,
  ContentCarousel,
} from "@/components/content-carousel";
import {
  type HeroContent,
  HeroSection,
  HeroSectionSkeleton,
} from "@/components/hero-section";
import { getTitles } from "@/http/get-titles";
import { generateMetadata } from "@/utils/metadata";

function moviesOrSeriesQueryOptions(type: ContentsType) {
  return queryOptions({
    queryKey: ["content", type.toLowerCase()],
    queryFn: async () => {
      try {
        const data = await getTitles({ limit: 10, contentType: type });
        return data?.items || [];
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 60,
  });
}

const moviesQueryOptions = moviesOrSeriesQueryOptions("MOVIE");
const seriesQueryOptions = moviesOrSeriesQueryOptions("SERIES");

export const Route = createFileRoute("/")({
  component: HomeComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(moviesQueryOptions);
    queryClient.ensureQueryData(seriesQueryOptions);
  },
  head: ({
    match: {
      context: { metadataTranslations },
    },
  }) => generateMetadata({ metadataTranslations, overrideTitle: true }),
  pendingComponent: () => (
    <main className="min-h-screen">
      <HeroSectionSkeleton />
      <div className="relative z-20">
        <CarouselSkeleton />
        <CarouselSkeleton />
      </div>
    </main>
  ),
});

function HomeComponent() {
  const t = useTranslations("homePage");

  const { data: movies } = useSuspenseQuery(moviesQueryOptions);
  const { data: series } = useSuspenseQuery(seriesQueryOptions);

  if (movies.length === 0 && series.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2">
        <h1 className="text-center text-2xl font-semibold">{t("noTitles")}</h1>
        <p className="text-muted-foreground text-center">{t("checkLater")}</p>
      </main>
    );
  }

  const titles = [...movies, ...series]
    .sort((a, b) => {
      const aDate = new Date(a.release_date || "");
      const bDate = new Date(b.release_date || "");
      return bDate.getTime() - aDate.getTime();
    })
    .slice(0, 4);
  const heroContent: HeroContent[] = titles.map((title) => {
    return {
      id: title.id,
      title: title.title,
      description: title.description,
      imageUrl: title.cover || "",
      type: title.content_type,
    };
  });

  return (
    <main>
      <HeroSection content={heroContent} />
      <div className="relative z-20">
        <ContentCarousel title={t("trending")} items={movies} />
        <ContentCarousel title={t("popularSeries")} items={series} />
      </div>
    </main>
  );
}
