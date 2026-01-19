import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import {
  createFileRoute,
  isNotFound,
  notFound,
  redirect,
} from "@tanstack/react-router";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { object, uuid } from "zod";
import { lazyComponents } from "@/components/lazy-components";
import { VideoPlayer } from "@/components/player/video-player";
import { releaseSession, sendHeartbeat } from "@/http/concurrency";
import { getDataToStream } from "@/http/get-titles";
import { isHttpNotFound } from "@/utils/errors";
import { generateMetadata } from "@/utils/metadata";

const watchSearchSchema = object({ episodeId: uuid().optional() });

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
    context: {
      queryClient,
      auth: { streamSessionId },
    },
    params: { titleId },
    deps: { episodeId },
  }) => {
    try {
      if (!streamSessionId) {
        throw redirect({ to: "/title/$titleId", params: { titleId } });
      }

      return await queryClient.ensureQueryData({
        queryKey: [
          "content",
          "title",
          titleId,
          "dataToStream",
          episodeId,
          streamSessionId,
        ],
        queryFn: () => getDataToStream(titleId, streamSessionId, episodeId),
        staleTime: 1000 * 60 * 60,
        retry: false,
      });
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
      title: data?.title.title || metadataTranslations("errors.NotFound"),
      description: data?.title.description,
      image: data?.title.cover ?? undefined,
      imageAlt: data?.title.title,
      isOnlyBase: isNotFound(error),
    }),
});

function WatchTitleComponent() {
  const t = useTranslations("playerPage");
  const streamSessionId = Route.useRouteContext({
    select: (search) => search.auth.streamSessionId,
  });
  const { titleId } = Route.useParams();
  const navigate = Route.useNavigate();
  const dataToStream = Route.useLoaderData();

  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isSessionAllowed, setIsSessionAllowed] = useState(false);

  const screensLimitReached = useCallback(async () => {
    toast.error(t("screensLimitReached"));
    await navigate({ to: "/title/$titleId", params: { titleId } });
  }, [navigate, t, titleId]);

  const handleHeartbeat = useCallback(async () => {
    if (!streamSessionId) return await screensLimitReached();

    const { allowed } = await sendHeartbeat(streamSessionId);
    if (!allowed) return await screensLimitReached();
    setIsSessionAllowed(allowed);
  }, [screensLimitReached, streamSessionId]);

  const initHeartbeat = useEffectEvent(async () => {
    await handleHeartbeat();
    heartbeatIntervalRef.current = setInterval(handleHeartbeat, 30000);
  });

  const releaseCurrentSession = useCallback(async () => {
    if (!streamSessionId) return;
    try {
      await releaseSession(streamSessionId);
    } catch (error) {
      console.error("Failed to release session", error);
    }
  }, [streamSessionId]);

  useEffect(() => {
    initHeartbeat();

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      releaseCurrentSession();
    };
  }, [releaseCurrentSession]);

  if (!streamSessionId) {
    toast.error(t("noStreamSession"));
    navigate({ to: "/title/$titleId", params: { titleId } });
    return null;
  }

  if (dataToStream.title.content_type === "SERIES" && !dataToStream.episode) {
    toast.warning(t("selectEpisode"));
    navigate({ to: "/title/$titleId", params: { titleId } });
    return null;
  }

  return isSessionAllowed ? (
    <VideoPlayer dataToStream={dataToStream} />
  ) : (
    <lazyComponents.PendingComponent />
  );
}
