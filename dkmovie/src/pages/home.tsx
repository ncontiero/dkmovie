import type { Title } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";
import {
  CarouselSkeleton,
  ContentCarousel,
} from "@/components/content-carousel";
import {
  type HeroContent,
  HeroSection,
  HeroSectionSkeleton,
} from "@/components/hero-section";
import { Meta } from "@/components/meta";

export default function HomePage() {
  const { data: titles = [], isLoading } = useQuery({
    queryKey: ["titles"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/titles/");
        const data = (await res.json()) as Title[];
        return data || [];
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading)
    return (
      <main className="min-h-screen">
        <HeroSectionSkeleton />
        <div className="relative z-20">
          <CarouselSkeleton />
          <CarouselSkeleton />
        </div>
      </main>
    );

  if (!titles || titles.length === 0)
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2">
        <h1 className="text-center text-2xl font-semibold">No titles found.</h1>
        <p className="text-muted-foreground text-center">
          Please check back later.
        </p>
      </main>
    );

  const heroContent: HeroContent[] = titles
    .map((title) => {
      return {
        id: title.id,
        title: title.title,
        description: title.description,
        imageUrl: title.cover || "",
        type: title.content_type,
      };
    })
    .slice(0, 4);

  const movies = titles
    .map((title) => {
      return title.content_type === "MOVIE" ? title : null;
    })
    .filter(Boolean) as Title[];

  const series = titles
    .map((title) => {
      return title.content_type === "SERIES" ? title : null;
    })
    .filter(Boolean) as Title[];

  return (
    <main>
      <Meta overrideTitle />

      <HeroSection content={heroContent} />
      <div className="relative z-20">
        <ContentCarousel title="Trending" items={movies} />
        <ContentCarousel title="Popular Series" items={series} />
      </div>
    </main>
  );
}
