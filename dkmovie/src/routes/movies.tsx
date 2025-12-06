import type { Genre } from "@/utils/types";
import {
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslations } from "use-intl";
import {
  CarouselSkeleton,
  ContentCarousel,
} from "@/components/content-carousel";
import { HeroSection, HeroSectionSkeleton } from "@/components/hero-section";
import { getGenres } from "@/http/get-genres";
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

const genresQueryOptions = queryOptions({
  queryKey: ["content", "genres"],
  queryFn: () => getGenres({ limit: 5 }),
  staleTime: 1000 * 60 * 60,
});

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
  pendingComponent: () => (
    <main className="min-h-screen">
      <HeroSectionSkeleton />
      <div className="relative z-20">
        <CarouselSkeleton />
        <CarouselSkeleton />
        <CarouselSkeleton />
        <CarouselSkeleton />
      </div>
    </main>
  ),
});

function GenreSection({ genre }: { readonly genre: Genre }) {
  const { data: movies, isLoading } = useQuery({
    queryKey: ["content", genre.slug, "movies"],
    queryFn: () =>
      getTitles({ limit: 10, contentType: "MOVIE", genre: genre.slug }),
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) {
    return <CarouselSkeleton />;
  }
  if (!movies || movies.length === 0) {
    return null;
  }

  return <ContentCarousel title={genre.name} items={movies} />;
}

function MoviesComponent() {
  const t = useTranslations("moviesPage");

  const { data: releasedInTheYear } = useSuspenseQuery(
    releasedInTheYearQueryOptions,
  );
  const { data: popularMovies } = useSuspenseQuery(popularMoviesQueryOptions);
  const { data: genres } = useSuspenseQuery(genresQueryOptions);

  return (
    <main>
      <HeroSection content={releasedInTheYear.slice(0, 5)} />
      <div className="relative z-20">
        <ContentCarousel
          title={t("moviesOfTheYear", { year: getReleaseYear() })}
          items={releasedInTheYear}
        />
        <ContentCarousel title={t("topRatedMovies")} items={popularMovies} />
        {genres?.map((genre) => (
          <GenreSection key={genre.slug} genre={genre} />
        ))}
      </div>
    </main>
  );
}
