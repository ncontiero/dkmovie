import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslations } from "use-intl";
import { ContentCarousel } from "@/components/content-carousel";
import { HeroSection } from "@/components/hero-section";
import { getTitles } from "@/http/get-titles";
import { generateMetadata } from "@/utils/metadata";

function getReleaseYear() {
  const date = new Date();
  const currentYear = date.getFullYear();
  return date.getMonth() <= 2 ? currentYear - 1 : currentYear;
}
const releasedInTheYearQueryOptions = queryOptions({
  queryKey: ["content", "releasedInTheYear"],
  queryFn: () =>
    getTitles({
      limit: 10,
      releaseYear: getReleaseYear(),
      contentType: "MOVIE",
    }),
  staleTime: 1000 * 60 * 60,
});

const popularMoviesQueryOptions = queryOptions({
  queryKey: ["content", "MOVIE"],
  queryFn: () =>
    getTitles({ limit: 10, contentType: "MOVIE", orderBy: "-rating" }),
  staleTime: 1000 * 60 * 60,
});

export const Route = createFileRoute("/movies")({
  component: MoviesComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(releasedInTheYearQueryOptions);
    queryClient.ensureQueryData(popularMoviesQueryOptions);
  },
  head: ({
    match: {
      context: { metadataTranslations },
    },
  }) =>
    generateMetadata({
      metadataTranslations,
      title: metadataTranslations("movies"),
    }),
});

function MoviesComponent() {
  const t = useTranslations("moviesPage");

  const { data: releasedInTheYear } = useSuspenseQuery(
    releasedInTheYearQueryOptions,
  );
  const { data: popularMovies } = useSuspenseQuery(popularMoviesQueryOptions);

  return (
    <main>
      <HeroSection content={releasedInTheYear.slice(0, 5)} />
      <div className="relative z-20">
        <ContentCarousel
          title={t("moviesOfTheYear", { year: getReleaseYear() })}
          items={releasedInTheYear}
        />
        <ContentCarousel title={t("topRatedMovies")} items={popularMovies} />
      </div>
    </main>
  );
}
