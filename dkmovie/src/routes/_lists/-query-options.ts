import type { ContentsType } from "@/utils/types";
import { queryOptions } from "@tanstack/react-query";
import { getTitlesWithCount } from "@/http/get-titles";

interface ListsQueryOptionsProps {
  listType: "my-list" | "search";
  search?: string;
  contentType?: ContentsType[];
  genre?: string;
  releaseYear?: number;
  page?: number;
}

export const PAGE_SIZE = 20;

export function listsQueryOptions({
  listType,
  search,
  contentType,
  genre,
  releaseYear,
  page,
}: ListsQueryOptionsProps) {
  return queryOptions({
    queryKey: [
      "content",
      listType,
      search,
      contentType,
      genre,
      releaseYear,
      page,
    ],
    queryFn: () => {
      if (
        listType === "search" &&
        !search &&
        (!contentType || contentType.length === 0) &&
        !genre &&
        !releaseYear
      )
        return { count: 0, items: [] };
      return getTitlesWithCount({
        title: search,
        contentTypeIn: contentType,
        genre,
        releaseYear,
        page,
        pageSize: PAGE_SIZE,
        isMyList: listType === "my-list",
      });
    },
    staleTime: 1000 * 60 * 60,
  });
}
