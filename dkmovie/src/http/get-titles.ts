import type {
  ContentsType,
  PaginationNumberQueryParams,
  Title,
} from "@/utils/types";
import { formataReleaseDate } from "@/utils/date";
import { type PaginationDataProps, httpClient } from "./client";

interface GetTitleProps extends PaginationNumberQueryParams {
  title?: string;
  contentType?: ContentsType;
  contentTypeIn?: ContentsType[];
  genre?: string;
  exclude?: string;
  orderBy?: string;
  releaseYear?: number;
}

export async function getTitlesWithCount({
  page,
  pageSize,
  title,
  contentType,
  contentTypeIn,
  genre,
  exclude,
  orderBy,
  releaseYear,
}: GetTitleProps = {}): Promise<PaginationDataProps<Title[]>> {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (pageSize) params.append("page_size", pageSize.toString());
  if (title) params.append("title", title);
  if (contentType) params.append("content_type", contentType);
  if (contentTypeIn) params.append("content_type_in", contentTypeIn.join(","));
  if (genre) params.append("genre", genre);
  if (exclude) params.append("exclude", exclude);
  if (orderBy) params.append("order_by", orderBy);
  if (releaseYear) {
    const releaseYearStart = formataReleaseDate(new Date(releaseYear, 1, 1));
    const releaseYearEnd = formataReleaseDate(new Date(releaseYear + 1, 1, 1));
    params.append("release_date__gte", releaseYearStart);
    params.append("release_date__lt", releaseYearEnd);
  }

  const url = `/titles/?${params.toString()}`;

  try {
    return await httpClient.get<PaginationDataProps<Title[]>>(url);
  } catch {
    return { count: 0, items: [] };
  }
}

export async function getTitles(props: GetTitleProps = {}) {
  const res = await getTitlesWithCount(props);
  return res?.items || [];
}

export async function getTitle(id: string) {
  return await httpClient.get<Title>(`/titles/${id}`);
}
