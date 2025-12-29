import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  isNotFound,
  notFound,
  redirect,
} from "@tanstack/react-router";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { object, uuid } from "zod";
import { VideoPlayer } from "@/components/player/video-player";
import { getEpisode } from "@/http/get-episodes";
import { getTitle } from "@/http/get-titles";
import { isHttpNotFound } from "@/utils/errors";
import { generateMetadata } from "@/utils/metadata";

const watchSearchSchema = object({ episodeId: uuid().optional() });

function episodeQueryOptions(episodeId?: string) {
  return queryOptions({
    queryKey: ["content", "episode", episodeId],
    queryFn: () => (episodeId ? getEpisode(episodeId) : null),
    staleTime: 1000 * 60 * 60,
    retry: false,
  });
}

export const Route = createFileRoute("/title/$titleId/watch")({
  component: WatchTitleComponent,
  validateSearch: watchSearchSchema,
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/auth/sign-in",
        search: { next: location.href },
      });
    }
  },
  loaderDeps: ({ search: { episodeId } }) => ({ episodeId }),
  loader: async ({
    context: { queryClient },
    params: { titleId },
    deps: { episodeId },
  }) => {
    try {
      const title = await queryClient.ensureQueryData({
        queryKey: ["content", "title", titleId],
        queryFn: () => getTitle(titleId),
        staleTime: 1000 * 60 * 60,
        retry: false,
      });

      if (title.content_type === "SERIES" && episodeId) {
        queryClient.ensureQueryData(episodeQueryOptions(episodeId));
      }

      return title;
    } catch (error) {
      if (isHttpNotFound(error)) throw notFound();
      throw error;
    }
  },
  head: ({
    match: {
      context: { metadataTranslations },
      error,
    },
    loaderData: data,
  }) =>
    generateMetadata({
      metadataTranslations,
      title: data?.title || metadataTranslations("errors.NotFound"),
      description: data?.description,
      image: data?.cover ?? undefined,
      imageAlt: data?.title,
      isOnlyBase: isNotFound(error),
    }),
});

function WatchTitleComponent() {
  const t = useTranslations("playerPage");
  const { titleId } = Route.useParams();
  const { episodeId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const title = Route.useLoaderData();

  let streamUrl = "";

  const { data: episode, isLoading: isEpisodeLoading } = useSuspenseQuery(
    episodeQueryOptions(episodeId),
  );

  const poster = episode?.still || title.cover || title.poster || undefined;

  if (title.content_type === "MOVIE") {
    streamUrl = `/api/streaming/title/${title.id}`;
  } else if (title.content_type === "SERIES" && episodeId) {
    streamUrl = `/api/streaming/episode/${episodeId}`;
  }

  if (title.content_type === "SERIES" && !episodeId) {
    toast.warning(t("selectEpisode"));
    navigate({ to: "/title/$titleId", params: { titleId } });
    return null;
  }

  if (
    title.content_type === "SERIES" &&
    !isEpisodeLoading &&
    (!episode || !episode.is_video_available)
  ) {
    toast.error(t("episodeNotAvailable"));
    navigate({ to: "/title/$titleId", params: { titleId } });
    return null;
  }

  return (
    <VideoPlayer
      title={title}
      episode={episode}
      src={streamUrl}
      poster={poster}
    />
  );
}
