import { type PropsWithChildren, useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  type CurrentSessionResponse,
  getCurrentSession,
  logout as logoutApi,
} from "@/http/auth/session";
import { SessionContext } from "./context";

const protectedRoutes = ["/account", "/account/security"];
const authRoutes = ["/auth/sign-in", "/auth/sign-up"];
const signInRoute = "/auth/sign-in";

export function SessionProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { data: session = null, isLoading: isLoadingSession } = useQuery({
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
    onMutate: () => {
      toast.loading("Logging out...", { id: "logout" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.setQueryData(["session"], null);
      toast.success("Logged out successfully", { id: "logout" });
    },
    onError: () => {
      toast.error("Failed to log out", { id: "logout" });
    },
  });

  const setSession = useCallback(
    (data?: CurrentSessionResponse | null) => {
      queryClient.setQueryData(["session"], data);
    },
    [queryClient],
  );

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
      logout,
      setSession,
    }),
    [
      isAuthenticated,
      isLoadingSession,
      isLogoutPending,
      logout,
      setSession,
      session?.data,
    ],
  );

  return (
    <SessionContext.Provider value={contextValues}>
      {children}
    </SessionContext.Provider>
  );
}
