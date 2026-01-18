import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { useFetchSession } from "@/hooks/fetch/use-fetch-session";
import { getMe } from "@/http/account/me";
import {
  type CurrentSessionResponse,
  logout as logoutApi,
} from "@/http/auth/session";
import { type SessionContextProps, SessionContext } from "./context";

export function SessionProvider({ children }: PropsWithChildren) {
  const t = useTranslations("auth.logOut");
  const [streamSessionId, setStreamSessionId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: session = null,
    isLoading: isLoadingSession,
    error: sessionError,
  } = useFetchSession();
  const { data: me } = useQuery({
    queryKey: ["session", "me"],
    queryFn: getMe,
    staleTime: 1000 * 60 * 60,
    enabled: !!session,
  });

  const isAuthenticated = session?.meta.is_authenticated || false;

  const { mutate: logoutMutation } = useMutation({
    mutationFn: logoutApi,
    onMutate: () => {
      toast.loading(t("loading"), { id: "logout" });
    },
    onSuccess: async () => {
      toast.success(t("success"), { id: "logout" });
      await queryClient.resetQueries();
    },
    onError: () => {
      toast.error(t("failed"), { id: "logout" });
    },
  });

  const setSession = useCallback(
    (data?: CurrentSessionResponse | null) => {
      queryClient.setQueryData(["session"], data);
    },
    [queryClient],
  );

  const initStreamSessionId = useEffectEvent(() => {
    if (typeof window === "undefined") return;

    const STORAGE_KEY = "stream_session_id";
    let sid = sessionStorage.getItem(STORAGE_KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem(STORAGE_KEY, sid);
    }
    setStreamSessionId(sid);
  });

  useEffect(() => {
    initStreamSessionId();
  }, []);

  const contextValues = useMemo(
    (): SessionContextProps => ({
      session: session?.data || null,
      user: me || null,
      sessionError,
      streamSessionId,
      isAuthenticated,
      isLoadingSession,
      logout: logoutMutation,
      setSession,
    }),
    [
      session?.data,
      me,
      sessionError,
      streamSessionId,
      isAuthenticated,
      isLoadingSession,
      logoutMutation,
      setSession,
    ],
  );

  return (
    <SessionContext.Provider value={contextValues}>
      {children}
    </SessionContext.Provider>
  );
}
