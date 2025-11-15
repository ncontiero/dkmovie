import type { ContentsType, Title } from "@/utils/types";
import { httpClient } from "./client";

interface GetTitleProps {
  limit?: number;
  offset?: number;
  title?: string;
  contentType?: ContentsType;
}

export interface ResponseDataProps<T = any> {
  items: T;
  count: number;
}

export async function getTitles({
  limit,
  offset,
  title,
  contentType,
}: GetTitleProps = {}) {
  const params = new URLSearchParams();
  if (limit) params.append("limit", limit.toString());
  if (offset) params.append("offset", offset.toString());
  if (title) params.append("title", title);
  if (contentType) params.append("content_type", contentType);

  const url = `/titles/?${params.toString()}`;
  return await httpClient.get<ResponseDataProps<Title[]>>(url);
}
