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
import { getTitles } from "@/http/get-titles";

export default function HomePage() {
  const { data: movies = [], isLoading: moviesLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: async () => {
      try {
        const data = await getTitles({ limit: 10, contentType: "MOVIE" });
        return data?.items || [];
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 60,
  });

  const { data: series = [], isLoading: seriesLoading } = useQuery({
    queryKey: ["series"],
    queryFn: async () => {
      try {
        const data = await getTitles({ limit: 10, contentType: "SERIES" });
        return data?.items || [];
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 60,
  });

  if (moviesLoading || seriesLoading)
    return (
      <main className="min-h-screen">
        <HeroSectionSkeleton />
        <div className="relative z-20">
          <CarouselSkeleton />
          <CarouselSkeleton />
        </div>
      </main>
    );

  if (!movies || !series || (movies.length === 0 && series.length === 0))
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2">
        <h1 className="text-center text-2xl font-semibold">No titles found.</h1>
        <p className="text-muted-foreground text-center">
          Please check back later.
        </p>
      </main>
    );

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
      <Meta overrideTitle />

      <HeroSection content={heroContent} />
      <div className="relative z-20">
        <ContentCarousel title="Trending" items={movies} />
        <ContentCarousel title="Popular Series" items={series} />
      </div>
    </main>
  );
}
