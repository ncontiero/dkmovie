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

  if (releasedInTheYear.length === 0 && popularSeries.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2">
        <h1 className="text-center text-2xl font-semibold">{t("noTitles")}</h1>
        <p className="text-muted-foreground text-center">{t("checkLater")}</p>
      </main>
    );
  }

  const releaseYear = getReleaseYear();

  return (
    <main>
      <HeroSection
        content={releasedInTheYear
          .filter((title) => title.cover !== null)
          .slice(0, 5)}
      />
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
