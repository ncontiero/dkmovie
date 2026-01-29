export interface SessionUser {
  id: number;
  email: string;
  has_usable_password: boolean;
}

export interface WatchHistoryEpisode {
  id: string;
  season_number: number;
  episode_number: number;
}

export interface WatchHistoryEntry {
  title: string;
  episode: WatchHistoryEpisode | null;
  watched_seconds: number;
  watched_at: string;
}

export interface User extends Omit<SessionUser, "has_usable_password"> {
  name: string;
  is_superuser: boolean;
  my_list: string[];
  history: WatchHistoryEntry[];
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
  poster: string | null;
  cover: string | null;
  duration: number;
  is_video_available: boolean;
  first_episode_id: string | null;
}

export interface TitleDetails extends Title {
  rating: number;
  cast: string;
  trailer_url: string | null;
  genres: Genre[];
  seasons: Season[];
  tracks: VideoTrack[];
}

export interface VideoSprite {
  image: string;
  start_time: number;
  end_time: number;
  interval: number;
  frame_width: number;
  frame_height: number;
  columns: number;
  rows: number;
}

export interface VideoTrack {
  language: string;
  label: string;
  is_original: boolean;
  subtitle_file: string | null;
}

export interface Episode {
  id: string;
  number: number;
  name: string;
  overview: string;
  still: string | null;
  air_date: string | null;
  rating: number;
  duration: number;
  is_video_available: boolean;
}

export interface VideoMarker {
  label: "recap" | "intro" | "credits";
  start_time: number;
  end_time: number;
}

export interface DataToStream {
  title: Title;
  season: Season | null;
  episode: Episode | null;
  next_episode: Episode | null;
  tracks: VideoTrack[];
  sprites: VideoSprite[];
  markers: VideoMarker[];
  session_id: string;
  stream_manifest_url: string;
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

export interface HLSApiLevelProps {
  height: number;
}
export interface HLSApiAudioTrack {
  id: number;
  name: string;
  lang: string;
}
export interface HLSApiProps {
  levels: HLSApiLevelProps[];
  currentLevel: number;
  audioTracks: HLSApiAudioTrack[];
  audioTrack: number;
}
