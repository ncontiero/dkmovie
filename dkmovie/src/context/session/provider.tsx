import { type PropsWithChildren, useCallback, useMemo } from "react";
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
  const isSuperUser = me?.is_superuser || false;

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

  const contextValues = useMemo(
    (): SessionContextProps => ({
      session: session?.data || null,
      sessionError,
      isAuthenticated,
      isSuperUser,
      isLoadingSession,
      logout: logoutMutation,
      setSession,
    }),
    [
      isAuthenticated,
      isLoadingSession,
      isSuperUser,
      logoutMutation,
      session?.data,
      sessionError,
      setSession,
    ],
  );

  return (
    <SessionContext.Provider value={contextValues}>
      {children}
    </SessionContext.Provider>
  );
}
