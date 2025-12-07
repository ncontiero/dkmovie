import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslations } from "use-intl";
import { ContentCarousel } from "@/components/content-carousel";
import { HeroSection } from "@/components/hero-section";
import { getReleaseYear } from "@/utils/date";
import { generateMetadata } from "@/utils/metadata";
import { genresQueryOptions } from "@/utils/query-options/genres";
import {
  getPopularMoviesOrSeriesQueryOptions,
  getReleasedInTheYearQueryOptions,
} from "@/utils/query-options/titles";
import { GenreSection, PendingComponent } from "./-movies-or-series-components";

const releasedInTheYearQueryOptions = getReleasedInTheYearQueryOptions("MOVIE");
const popularMoviesQueryOptions = getPopularMoviesOrSeriesQueryOptions("MOVIE");

export const Route = createFileRoute("/movies")({
  component: MoviesComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(releasedInTheYearQueryOptions);
    queryClient.ensureQueryData(popularMoviesQueryOptions);
    queryClient.ensureQueryData(genresQueryOptions);
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
  pendingComponent: PendingComponent,
});

function MoviesComponent() {
  const t = useTranslations("titlesPage");

  const { data: releasedInTheYear } = useSuspenseQuery(
    releasedInTheYearQueryOptions,
  );
  const { data: popularMovies } = useSuspenseQuery(popularMoviesQueryOptions);
  const { data: genres } = useSuspenseQuery(genresQueryOptions);

  const releaseYear = getReleaseYear();

  return (
    <main>
      <HeroSection content={releasedInTheYear.slice(0, 5)} />
      <div className="relative z-20">
        <ContentCarousel
          title={t("moviesOfTheYear", { year: releaseYear })}
          items={releasedInTheYear}
          searchParams={{ page: 1, releaseYear, contentTypes: ["MOVIE"] }}
        />
        <ContentCarousel title={t("topRatedMovies")} items={popularMovies} />
        {genres?.map((genre) => (
          <GenreSection
            key={genre.slug}
            genre={genre}
            type="MOVIE"
            searchParams={{
              page: 1,
              genre: genre.name,
              contentTypes: ["MOVIE"],
            }}
          />
        ))}
      </div>
    </main>
  );
}
