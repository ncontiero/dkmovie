import { type PropsWithChildren, useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { useFetchSession } from "@/hooks/fetch/use-fetch-session";
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

  const contextValues = useMemo(
    (): SessionContextProps => ({
      session: session?.data || null,
      sessionError,
      isAuthenticated,
      isLoadingSession,
      logout: logoutMutation,
      setSession,
    }),
    [
      isAuthenticated,
      isLoadingSession,
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
