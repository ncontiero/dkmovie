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

const releasedInTheYearQueryOptions =
  getReleasedInTheYearQueryOptions("SERIES");
const popularSeriesQueryOptions =
  getPopularMoviesOrSeriesQueryOptions("SERIES");

export const Route = createFileRoute("/series")({
  component: SeriesComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(releasedInTheYearQueryOptions);
    queryClient.ensureQueryData(popularSeriesQueryOptions);
    queryClient.ensureQueryData(genresQueryOptions);
  },
  head: ({
    match: {
      context: { metadataTranslations },
    },
  }) =>
    generateMetadata({
      metadataTranslations,
      title: metadataTranslations("series"),
    }),
  pendingComponent: PendingComponent,
});

function SeriesComponent() {
  const t = useTranslations("titlesPage");

  const { data: releasedInTheYear } = useSuspenseQuery(
    releasedInTheYearQueryOptions,
  );
  const { data: popularSeries } = useSuspenseQuery(popularSeriesQueryOptions);
  const { data: genres } = useSuspenseQuery(genresQueryOptions);

  const releaseYear = getReleaseYear();

  return (
    <main>
      <HeroSection content={releasedInTheYear.slice(0, 5)} />
      <div className="relative z-20">
        <ContentCarousel
          title={t("seriesOfTheYear", { year: releaseYear })}
          items={releasedInTheYear}
          searchParams={{ page: 1, releaseYear, contentTypes: ["SERIES"] }}
        />
        <ContentCarousel title={t("topRatedSeries")} items={popularSeries} />
        {genres?.map((genre) => (
          <GenreSection
            key={genre.slug}
            genre={genre}
            type="SERIES"
            searchParams={{
              page: 1,
              genre: genre.name,
              contentTypes: ["SERIES"],
            }}
          />
        ))}
      </div>
    </main>
  );
}
