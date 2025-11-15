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
  genres: Genre[];
  poster: string | null;
  cover: string | null;
  trailer_url: string;
}
