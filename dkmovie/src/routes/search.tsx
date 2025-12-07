import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslations } from "use-intl";
import { TitleCard, TitleCardSkeleton } from "@/components/title-card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getTitles } from "@/http/get-titles";
import { searchParamSchema } from "@/schemas/search";

function searchQueryOptions(search?: string) {
  return queryOptions({
    queryKey: ["content", "search", search],
    queryFn: () => {
      if (!search) return [];
      return getTitles({ title: search });
    },
    staleTime: 1000 * 60 * 60,
  });
}

export const Route = createFileRoute("/search")({
  component: SearchComponent,
  validateSearch: (search) => searchParamSchema.parse(search),
  loaderDeps: ({ search: { search } }) => ({ search }),
  loader: ({ context: { queryClient }, deps: { search } }) => {
    queryClient.ensureQueryData(searchQueryOptions(search));
  },
  pendingComponent: () => (
    <div className="mt-24 min-h-screen">
      <main className="mx-auto h-[70vh] max-w-7xl px-4 sm:container md:h-[80vh]">
        <Skeleton className="h-9 w-1/4" />
        <Separator className="mt-2 mb-5" />
        <div className="xs:grid-cols-2 grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <TitleCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  ),
});

function SearchComponent() {
  const t = useTranslations("search");

  const { search } = Route.useSearch();
  const { data: titles } = useSuspenseQuery(searchQueryOptions(search));

  if (!titles || titles.length === 0)
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2">
        <h1 className="text-center text-2xl font-semibold">{t("noTitles")}</h1>
        <p className="text-muted-foreground text-center">
          {t("tryAnotherTerm")}
        </p>
      </main>
    );

  return (
    <main className="my-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:container">
        <h1 className="text-2xl font-bold">
          {t("titlesFound", { count: titles.length })}
        </h1>
        <Separator className="mt-2 mb-5" />
        <div className="xs:grid-cols-2 grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {titles?.map((title) => (
            <TitleCard key={title.id} title={title} />
          ))}
        </div>
      </div>
    </main>
  );
}
