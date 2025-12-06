import type { Genre, PaginationQueryParams } from "@/utils/types";
import { type PaginationDataProps, httpClient } from "./client";

interface GetGenresProps extends PaginationQueryParams {
  slug?: string;
  name?: string;
}

export async function getGenres({
  limit,
  offset,
  slug,
  name,
}: GetGenresProps = {}) {
  const params = new URLSearchParams();
  if (limit) params.append("limit", limit.toString());
  if (offset) params.append("offset", offset.toString());
  if (slug) params.append("slug", slug);
  if (name) params.append("name", name);

  const url = `/genres/?${params.toString()}`;

  try {
    const res = await httpClient.get<PaginationDataProps<Genre[]>>(url);
    return res?.items || [];
  } catch {
    return [];
  }
}
