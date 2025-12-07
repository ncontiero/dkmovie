import type { ContentsType, Genre } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";
import {
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
}

export function GenreSection({ genre, type }: GenreSectionProps) {
  const { data: movies, isLoading } = useQuery({
    queryKey: ["content", genre.slug, type],
    queryFn: () =>
      getTitles({ limit: 10, contentType: type, genre: genre.slug }),
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
