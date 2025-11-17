import { type PropsWithChildren, useCallback, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getCurrentSession, logout as logoutApi } from "@/http/auth/session";
import { SessionContext } from "./context";

export function SessionProvider({ children }: PropsWithChildren) {
  const {
    data: session = null,
    isLoading: isLoadingSession,
    refetch: refetchSession,
  } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      return await getCurrentSession();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isAuthenticated = session?.meta.is_authenticated || false;

  const { mutate: logoutMutation, isPending: isLogoutPending } = useMutation({
    mutationFn: async () => {
      return await logoutApi();
    },
  });

  const logout = useCallback(() => {
    logoutMutation(undefined, {
      onSuccess: () => {
        refetchSession();
      },
    });
  }, [logoutMutation, refetchSession]);

  const contextValues = useMemo(
    () => ({
      session: session?.data || null,
      isAuthenticated,
      isLoadingSession,
      isLogoutPending,
      refetchSession,
      logout,
    }),
    [
      isAuthenticated,
      isLoadingSession,
      isLogoutPending,
      logout,
      refetchSession,
      session?.data,
    ],
  );

  return (
    <SessionContext.Provider value={contextValues}>
      {children}
    </SessionContext.Provider>
  );
}
