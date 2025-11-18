import type { ContentsType, Title } from "@/utils/types";
import { type PaginationDataProps, httpClient } from "./client";

interface GetTitleProps {
  limit?: number;
  offset?: number;
  title?: string;
  contentType?: ContentsType;
  exclude?: string;
}

export async function getTitles({
  limit,
  offset,
  title,
  contentType,
  exclude,
}: GetTitleProps = {}) {
  const params = new URLSearchParams();
  if (limit) params.append("limit", limit.toString());
  if (offset) params.append("offset", offset.toString());
  if (title) params.append("title", title);
  if (contentType) params.append("content_type", contentType);
  if (exclude) params.append("exclude", exclude);

  const url = `/titles/?${params.toString()}`;
  return await httpClient.get<PaginationDataProps<Title[]>>(url);
}

export async function getTitle(id: string) {
  return await httpClient.get<Title>(`/titles/${id}`);
}
