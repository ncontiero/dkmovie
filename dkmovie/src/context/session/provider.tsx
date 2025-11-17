import { type PropsWithChildren, useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentSession, logout as logoutApi } from "@/http/auth/session";
import { SessionContext } from "./context";

const protectedRoutes = ["/account"];
const authRoutes = ["/sign-in", "/sign-up"];
const signInRoute = "/sign-in";

export function SessionProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
    onSuccess: () => {
      queryClient.setQueryData(["session"], null);
    },
  });

  const logout = useCallback(() => {
    logoutMutation();
  }, [logoutMutation]);

  useEffect(() => {
    if (isLoadingSession) return;
    if (!isAuthenticated && protectedRoutes.includes(pathname)) {
      navigate(signInRoute);
    }
    if (isAuthenticated && authRoutes.includes(pathname)) {
      navigate("/account");
    }
  }, [isAuthenticated, isLoadingSession, navigate, pathname]);

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
