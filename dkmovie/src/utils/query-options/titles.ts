import type { ContentsType } from "../types";
import { queryOptions } from "@tanstack/react-query";
import { getTitles } from "@/http/get-titles";
import { getReleaseYear } from "../date";

export function getPopularMoviesOrSeriesQueryOptions(type: ContentsType) {
  return queryOptions({
    queryKey: ["content", type],
    queryFn: () =>
      getTitles({ limit: 10, contentType: type, orderBy: "-rating" }),
    staleTime: 1000 * 60 * 60,
  });
}

export function getReleasedInTheYearQueryOptions(type: ContentsType) {
  return queryOptions({
    queryKey: ["content", type, "releasedInTheYear"],
    queryFn: () =>
      getTitles({
        limit: 10,
        releaseYear: getReleaseYear(),
        contentType: type,
      }),
    staleTime: 1000 * 60 * 60,
  });
}
