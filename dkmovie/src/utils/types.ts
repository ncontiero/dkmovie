export interface SessionUser {
  id: number;
  email: string;
  has_usable_password: boolean;
}

export interface User extends Omit<SessionUser, "has_usable_password"> {
  name: string;
  is_superuser: boolean;
}

export interface Session {
  user: SessionUser;
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
  episode_count: number;
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

export interface Episode {
  id: string;
  number: number;
  name: string;
  overview: string;
  still: string | null;
  air_date: string | null;
  duration: number;
  rating: number;
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
