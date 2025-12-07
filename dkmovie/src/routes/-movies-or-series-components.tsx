import type { ContentsType, Genre } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";
import {
  type CarouselProps,
  CarouselSkeleton,
  ContentCarousel,
} from "@/components/content-carousel";
import { HeroSectionSkeleton } from "@/components/hero-section";
import { getTitles } from "@/http/get-titles";

export function PendingComponent() {
  return (
    <main className="min-h-screen">
      <HeroSectionSkeleton />
      <div className="relative z-20">
        <CarouselSkeleton />
        <CarouselSkeleton />
        <CarouselSkeleton />
      </div>
    </main>
  );
}

interface GenreSectionProps {
  readonly genre: Genre;
  readonly type: ContentsType;
  readonly searchParams?: CarouselProps["searchParams"];
}

export function GenreSection({ genre, type, searchParams }: GenreSectionProps) {
  const { data: movies, isLoading } = useQuery({
    queryKey: ["content", genre.slug, type],
    queryFn: () => getTitles({ contentType: type, genre: genre.slug }),
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) {
    return <CarouselSkeleton />;
  }
  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <ContentCarousel
      title={genre.name}
      items={movies}
      searchParams={searchParams}
    />
  );
}
