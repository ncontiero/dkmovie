import type { ContentsType } from "@/utils/types";
import { useCallback } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useTranslations } from "use-intl";
import { TitleCard, TitleCardSkeleton } from "@/components/title-card";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getTitles } from "@/http/get-titles";
import { searchParamSchema } from "@/schemas/search";
import { searchGenresQueryOptions } from "@/utils/query-options/genres";

function searchQueryOptions(
  search?: string,
  contentType?: ContentsType[],
  genre?: string,
) {
  return queryOptions({
    queryKey: ["content", "search", search, contentType, genre],
    queryFn: () => {
      if (!search && (!contentType || contentType.length === 0) && !genre)
        return [];
      return getTitles({ title: search, contentTypeIn: contentType, genre });
    },
    staleTime: 1000 * 60 * 60,
  });
}

export const Route = createFileRoute("/search")({
  component: SearchComponent,
  validateSearch: (search) => searchParamSchema.parse(search),
  loaderDeps: ({ search: { search, contentTypes, genre } }) => ({
    search,
    contentTypes,
    genre,
  }),
  loader: ({
    context: { queryClient },
    deps: { search, contentTypes, genre },
  }) => {
    queryClient.ensureQueryData(
      searchQueryOptions(search, contentTypes, genre),
    );
    queryClient.ensureQueryData(searchGenresQueryOptions);
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

  const router = useRouter();
  const { search, contentTypes, genre: searchGenre } = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data: titles } = useSuspenseQuery(
    searchQueryOptions(search, contentTypes, searchGenre),
  );
  const { data: genres } = useSuspenseQuery(searchGenresQueryOptions);

  const onContentTypeChange = useCallback(
    async (contentType: ContentsType) => {
      const newContentTypes = contentTypes?.includes(contentType)
        ? contentTypes.filter((c) => c !== contentType)
        : [...(contentTypes ?? []), contentType];

      await router.invalidate();
      if (newContentTypes.length === 0) {
        await navigate({
          search: (prev) => ({ ...prev, contentTypes: undefined }),
        });
      }

      await navigate({
        search: (prev) => ({ ...prev, contentTypes: newContentTypes }),
      });
    },
    [contentTypes, navigate, router],
  );

  const onGenreSelect = useCallback(
    async (genre: string) => {
      const genreToAdd = genre === searchGenre ? undefined : genre;
      await router.invalidate();
      await navigate({ search: (prev) => ({ ...prev, genre: genreToAdd }) });
    },
    [navigate, router, searchGenre],
  );

  const contentTypeLength = contentTypes ? contentTypes.length : 0;
  const contentTypeText = contentTypeLength > 0 ? `(${contentTypeLength})` : "";
  const searchGenreText = searchGenre ? `(${searchGenre})` : "";
  const filterLength = contentTypeLength + (searchGenre ? 1 : 0);
  const filterLengthText = filterLength > 0 ? `(${filterLength})` : "";

  return (
    <main className="my-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:container">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {t("titlesFound", { count: titles.length })}
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline">
                {t("filters")} {filterLengthText}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="p-2">
                  {t("filterGenre")} {searchGenreText}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-background">
                  <Command className="bg-background">
                    <CommandInput placeholder={t("searchGenre")} autoFocus />
                    <CommandList>
                      <CommandEmpty>{t("noGenres")}</CommandEmpty>
                      <CommandGroup>
                        {genres?.map((genre) => (
                          <CommandItem
                            key={genre.slug}
                            value={genre.name}
                            onSelect={onGenreSelect}
                            className="p-2"
                          >
                            {genre.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="p-2">
                  {t("contentType")} {contentTypeText}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-background">
                  <DropdownMenuCheckboxItem
                    className="bg-background py-2"
                    checked={contentTypes?.includes("MOVIE")}
                    onCheckedChange={() => onContentTypeChange("MOVIE")}
                  >
                    {t("movies")}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    className="bg-background py-2"
                    checked={contentTypes?.includes("SERIES")}
                    onCheckedChange={() => onContentTypeChange("SERIES")}
                  >
                    {t("series")}
                  </DropdownMenuCheckboxItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
