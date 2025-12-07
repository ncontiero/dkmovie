import { queryOptions } from "@tanstack/react-query";
import { getGenres } from "@/http/get-genres";

export const genresQueryOptions = queryOptions({
  queryKey: ["content", "genres"],
  queryFn: () => getGenres({ limit: 5 }),
  staleTime: 1000 * 60 * 60,
});

export const searchGenresQueryOptions = queryOptions({
  queryKey: ["content", "search", "genres"],
  queryFn: () => getGenres(),
  staleTime: 1000 * 60 * 60,
});
