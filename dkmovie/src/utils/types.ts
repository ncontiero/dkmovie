export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Session {
  user: Omit<User, "name"> & { has_usable_password: boolean };
}

export type ContentsType = "MOVIE" | "SERIES";

export interface Genre {
  name: string;
  slug: string;
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

export interface PaginationDataProps<T = any> {
  items: T;
  count: number;
}

export interface PaginationQueryParams {
  limit?: number;
  offset?: number;
}
