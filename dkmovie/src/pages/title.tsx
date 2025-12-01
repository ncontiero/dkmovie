import React, { useMemo } from "react";
import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Play, Plus } from "lucide-react";
import { useTranslations } from "use-intl";
import { ContentCarousel } from "@/components/content-carousel";
import { Meta } from "@/components/meta";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getTitle, getTitles } from "@/http/get-titles";
import PageNotFound from "./error/404";

function TitlePageSkeleton() {
  return (
    <Skeleton className="min-h-screen">
      <div className="relative h-[70vh] w-full md:h-[80vh]">
        <div className="relative z-10 flex h-full flex-col justify-end">
          <div className="container mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <Skeleton className="bg-background h-10 w-3/4 sm:h-12 lg:h-14" />
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <Skeleton className="bg-background h-6 w-16" />
                <Skeleton className="bg-background h-6 w-20" />
                <Skeleton className="bg-background h-6 w-12" />
              </div>
              <div className="hidden space-y-2 pt-2 md:block">
                <Skeleton className="bg-background h-6 w-full" />
                <Skeleton className="bg-background h-6 w-full" />
                <Skeleton className="bg-background h-6 w-2/3" />
              </div>
              <div className="flex gap-4 pt-4">
                <Skeleton className="bg-background h-12 w-36" />
                <Skeleton className="bg-background h-12 w-36" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
        <div className="mb-6 space-y-2 md:hidden">
          <Skeleton className="bg-background h-5 w-full" />
          <Skeleton className="bg-background h-5 w-full" />
          <Skeleton className="bg-background h-5 w-2/3" />
        </div>
        <Skeleton className="bg-background mb-6 h-8 w-1/3" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-3 md:col-span-2">
            <Skeleton className="bg-background mb-3 h-6 w-1/4" />
            <Skeleton className="bg-background h-4 w-1/2" />
            <Skeleton className="bg-background h-4 w-1/2" />
            <Skeleton className="bg-background h-4 w-1/2" />
          </div>
          <div className="space-y-3">
            <div className="bg-muted mb-3 h-6 w-1/3 rounded-md" />
            <div className="bg-muted h-4 w-1/2 rounded-md" />
          </div>
        </div>
      </div>
    </Skeleton>
  );
}

export default function TitlePage() {
  const t = useTranslations("titlePage");
  const { id } = useParams();

  const { data: title, isLoading } = useQuery({
    queryKey: ["content", "title", id],
    queryFn: async () => {
      if (!id) return null;
      try {
        return await getTitle(id);
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 60,
  });

  const { data: relatedMovies = [], isLoading: relatedMoviesLoading } =
    useQuery({
      queryKey: ["content", "relatedMovies", id],
      queryFn: async () => {
        if (!id) return [];
        try {
          const data = await getTitles({ limit: 10, exclude: id });
          return data?.items || [];
        } catch (error) {
          console.error(error);
          return [];
        }
      },
      staleTime: 1000 * 60 * 60,
    });

  const durationFormatted = useMemo(() => {
    if (!title || !title.duration) return null;
    const hours = Math.floor(title.duration / 60);
    const minutes = title.duration % 60;
    return `${hours}h ${minutes}m`;
  }, [title]);

  if (isLoading || relatedMoviesLoading) return <TitlePageSkeleton />;
  if (!title) return <PageNotFound />;

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Meta
        title={title.title}
        description={title.description}
        image={title.cover || undefined}
        imageAlt={title.title}
      />
      <main>
        <div className="relative h-[70vh] w-full md:h-[80vh]">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${title.cover})` }}
          />

          <div className="from-background via-background/80 absolute inset-0 bg-linear-to-t to-transparent" />

          <div className="relative z-10 flex h-full flex-col justify-end">
            <div className="container mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <h1 className="text-foreground text-4xl font-extrabold drop-shadow-lg sm:text-5xl lg:text-6xl">
                  {title.title}
                </h1>

                <div className="text-muted-foreground my-4 flex flex-wrap items-center gap-4">
                  {title.release_date ? (
                    <span className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      {new Date(title.release_date).getFullYear()}
                    </span>
                  ) : null}
                  {durationFormatted ? (
                    <span className="flex items-center gap-2">
                      <Clock className="size-4" />
                      {durationFormatted}
                    </span>
                  ) : null}
                  <span
                    className={`
                      text-foreground/90 flex items-center gap-2 rounded-sm border border-yellow-500 px-2 py-0.5 text-sm
                      font-medium dark:border-yellow-400
                    `}
                  >
                    {title.rating}
                  </span>
                </div>

                {title.genres && title.genres.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {title.genres.map((genre) => (
                      <span
                        key={genre.slug}
                        className={`
                          border-foreground/50 text-foreground/90 rounded-sm border px-2 py-0.5 text-sm font-medium
                        `}
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                ) : null}

                <p className="text-foreground/90 mt-4 hidden max-w-prose text-lg drop-shadow-md md:block">
                  {title.description}
                </p>

                <div className="mt-8 flex gap-4">
                  <Button
                    asChild
                    className="hover:scale-105 focus-visible:scale-105"
                    size="lg"
                  >
                    <Link to={`/title/${title.id}/watch`}>
                      <Play className="fill-current" />
                      {t("watch")}
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="hover:scale-105 focus-visible:scale-105"
                    size="lg"
                  >
                    <Plus />
                    {t("myList")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
          <p className="text-foreground/90 mb-6 text-base md:hidden">
            {title.description}
          </p>

          <h2 className="text-foreground mb-6 text-3xl font-semibold">
            {t("details")}
          </h2>

          <div className="text-muted-foreground grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <h3 className="text-foreground mb-3 text-xl font-semibold">
                {t("cast")}
              </h3>
              <p>{title.cast}</p>
            </div>
          </div>
        </div>

        <div className="border-border mt-8 border-t md:mt-12">
          <ContentCarousel title={t("moreLikeThis")} items={relatedMovies} />
        </div>
      </main>
    </div>
  );
}
