import type { ContentsType } from "@/utils/types";
import { useCallback } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useTranslations } from "use-intl";
import { listsParamSchema } from "@/schemas/lists";
import { generateMetadata } from "@/utils/metadata";
import { genresListQueryOptions } from "@/utils/query-options/genres";
import { ListComponent, ListPendingComponent } from "./-container";
import { listsQueryOptions, PAGE_SIZE } from "./-query-options";

export const Route = createFileRoute("/_lists/my-list")({
  component: RouteComponent,
  validateSearch: (search) => listsParamSchema.parse(search),
  loaderDeps: ({ search: { contentTypes, genre, page } }) => ({
    contentTypes,
    genre,
    page,
  }),
  loader: ({
    context: { queryClient },
    deps: { contentTypes, genre, page },
  }) => {
    queryClient.ensureQueryData(
      listsQueryOptions({
        listType: "my-list",
        contentType: contentTypes,
        genre,
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
      title: metadataTranslations("myList"),
    }),
  pendingComponent: ListPendingComponent,
});

function RouteComponent() {
  const t = useTranslations("myListPage");

  const router = useRouter();
  const navigate = Route.useNavigate();
  const { contentTypes, genre: searchGenre, page } = Route.useSearch();
  const { data: titles } = useSuspenseQuery(
    listsQueryOptions({
      listType: "my-list",
      contentType: contentTypes,
      genre: searchGenre,
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
      title={t("title", { count: titles.count })}
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
