export interface User {
  id: number;
  name: string;
  email: string;
  is_superuser: boolean;
}

export interface Session {
  user: Omit<User, "name"> & { has_usable_password: boolean };
}

export const contentsType = ["MOVIE", "SERIES"] as const;
export type ContentsType = (typeof contentsType)[number];

export interface Genre {
  name: string;
  slug: string;
}

export interface Season {
  id: string;
  number: number;
  name: string;
  overview: string;
  poster: string | null;
  air_date: string | null;
  rating: number;
}

export interface Title {
  id: string;
  title: string;
  description: string;
  content_type: ContentsType;
  release_date: string | null;
  duration: number | null;
  rating: number;
  cast: string;
  genres: Genre[];
  poster: string | null;
  cover: string | null;
  trailer_url: string;
}
export interface TitleDetails extends Title {
  seasons: Season[];
}

export interface PaginationDataProps<T = any> {
  items: T;
  count: number;
}

export interface PaginationNumberQueryParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationLimitQueryParams {
  limit?: number;
  offset?: number;
}
