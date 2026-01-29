import type { ContentsType } from "@/utils/types";
import { useCallback } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useTranslations } from "use-intl";

import { searchParamSchema } from "@/schemas/lists";
import { generateMetadata } from "@/utils/metadata";
import { genresListQueryOptions } from "@/utils/query-options/genres";
import { ListComponent, ListPendingComponent } from "./-container";
import { listsQueryOptions, PAGE_SIZE } from "./-query-options";

export const Route = createFileRoute("/_lists/search")({
  component: SearchComponent,
  validateSearch: (search) => searchParamSchema.parse(search),
  loaderDeps: ({
    search: { search, contentTypes, genre, releaseYear, page },
  }) => ({
    search,
    contentTypes,
    genre,
    releaseYear,
    page,
  }),
  loader: ({
    context: { queryClient },
    deps: { search, contentTypes, genre, releaseYear, page },
  }) => {
    queryClient.ensureQueryData(
      listsQueryOptions({
        listType: "search",
        search,
        contentType: contentTypes,
        genre,
        releaseYear,
        page,
      }),
    );
    queryClient.ensureQueryData(genresListQueryOptions);
  },
  head: ({
    match: {
      context: { metadataTranslations },
    },
  }) =>
    generateMetadata({
      metadataTranslations,
      title: metadataTranslations("search"),
    }),
  pendingComponent: ListPendingComponent,
});

function SearchComponent() {
  const t = useTranslations("search");

  const router = useRouter();
  const navigate = Route.useNavigate();
  const {
    search,
    contentTypes,
    genre: searchGenre,
    releaseYear,
    page,
  } = Route.useSearch();
  const { data: titles } = useSuspenseQuery(
    listsQueryOptions({
      listType: "search",
      search,
      contentType: contentTypes,
      genre: searchGenre,
      releaseYear,
      page,
    }),
  );

  const onContentTypeChange = useCallback(
    async (contentType: ContentsType) => {
      const newContentTypes = contentTypes?.includes(contentType)
        ? contentTypes.filter((c) => c !== contentType)
        : [...(contentTypes ?? []), contentType];

      await router.invalidate();
      if (newContentTypes.length === 0) {
        await navigate({
          search: (prev) => ({ ...prev, contentTypes: undefined, page: 1 }),
        });
      }

      await navigate({
        search: (prev) => ({ ...prev, contentTypes: newContentTypes, page: 1 }),
      });
    },
    [contentTypes, navigate, router],
  );

  const onGenreSelect = useCallback(
    async (genre: string) => {
      const genreToAdd = genre === searchGenre ? undefined : genre;
      await router.invalidate();
      await navigate({
        search: (prev) => ({ ...prev, genre: genreToAdd, page: 1 }),
      });
    },
    [navigate, router, searchGenre],
  );

  return (
    <ListComponent
      title={t("titlesFound", { count: titles.count })}
      contentTypes={contentTypes}
      searchGenre={searchGenre}
      page={page}
      pages={Math.ceil(titles.count / PAGE_SIZE)}
      titles={titles.items}
      onGenreSelect={onGenreSelect}
      onContentTypeChange={onContentTypeChange}
    />
  );
}
