import { type PropsWithChildren, useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useFetchSession } from "@/hooks/fetch/use-fetch-session";
import {
  type CurrentSessionResponse,
  logout as logoutApi,
} from "@/http/auth/session";
import { MFAProvider } from "../mfa/provider";
import { type SessionContextProps, SessionContext } from "./context";

const protectedRoutes = ["/account", "/account/security"];
const authRoutes = ["/auth/sign-in", "/auth/sign-up", "/auth/2fa"];
const signInRoute = "/auth/sign-in";

export function SessionProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const {
    data: session = null,
    isLoading: isLoadingSession,
    error: sessionError,
  } = useFetchSession();

  const isAuthenticated = session?.meta.is_authenticated || false;

  const { mutate: logoutMutation } = useMutation({
    mutationFn: async () => {
      return await logoutApi();
    },
    onMutate: () => {
      toast.loading("Logging out...", { id: "logout" });
    },
    onSuccess: () => {
      queryClient.clear();
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

  useEffect(() => {
    if (isLoadingSession) return;

    if (!isAuthenticated && protectedRoutes.includes(pathname)) {
      navigate(`${signInRoute}?next=${pathname}`);
    }
    if (isAuthenticated && authRoutes.includes(pathname)) {
      navigate("/account");
    }
  }, [isAuthenticated, isLoadingSession, navigate, pathname]);

  const contextValues = useMemo(
    (): SessionContextProps => ({
      session: session?.data || null,
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
      setSession,
    ],
  );

  return (
    <SessionContext.Provider value={contextValues}>
      <MFAProvider sessionError={sessionError}>{children}</MFAProvider>
    </SessionContext.Provider>
  );
}
