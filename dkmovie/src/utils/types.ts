export type ContentsType = "movie" | "serie";

export interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  type: ContentsType;
}
