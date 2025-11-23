import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ReAuthenticateDialog } from "@/components/reauthenticate";
import {
  type CurrentSessionResponse,
  getCurrentSession,
  logout as logoutApi,
} from "@/http/auth/session";
import { HTTPError } from "@/http/client";
import { need2FA } from "@/utils/auth-flows";
import { type SessionContextProps, SessionContext } from "./context";

const protectedRoutes = ["/account", "/account/security"];
const authRoutes = ["/auth/sign-in", "/auth/sign-up"];
const signInRoute = "/auth/sign-in";

export function SessionProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isReAuthenticationNeeded, setIsReAuthenticationNeeded] =
    useState(false);
  const [onReAuthenticatedCallback, setOnReAuthenticatedCallback] = useState(
    () => () => setIsReAuthenticationNeeded(false),
  );

  const {
    data: session = null,
    isLoading: isLoadingSession,
    error: sessionError,
  } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      return await getCurrentSession();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (count, error) => {
      if (error instanceof HTTPError && error.status === 401) {
        return false;
      }
      return count < 3;
    },
  });

  const isAuthenticated = session?.meta.is_authenticated || false;

  const { mutate: logoutMutation } = useMutation({
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

  const initializeReAuthentication = useCallback((callback?: () => void) => {
    toast.error("You need to re-authenticate to continue");
    setIsReAuthenticationNeeded(true);
    if (callback) {
      // eslint-disable-next-line unicorn/consistent-function-scoping
      setOnReAuthenticatedCallback(() => () => {
        setIsReAuthenticationNeeded(false);
        callback();
      });
    }
  }, []);

  useEffect(() => {
    if (isLoadingSession) return;
    if (need2FA(sessionError)) {
      navigate(`/auth/2fa?next=${pathname}`);
      return;
    }

    if (!isAuthenticated && protectedRoutes.includes(pathname)) {
      navigate(signInRoute);
    }
    if (isAuthenticated && authRoutes.includes(pathname)) {
      navigate("/account");
    }
  }, [isAuthenticated, isLoadingSession, navigate, pathname, sessionError]);

  const contextValues = useMemo(
    (): SessionContextProps => ({
      session: session?.data || null,
      isAuthenticated,
      isLoadingSession,
      logout: logoutMutation,
      setSession,
      initializeReAuthentication,
      isReAuthenticating: isReAuthenticationNeeded,
    }),
    [
      session?.data,
      isAuthenticated,
      isLoadingSession,
      logoutMutation,
      setSession,
      initializeReAuthentication,
      isReAuthenticationNeeded,
    ],
  );

  return (
    <SessionContext.Provider value={contextValues}>
      {isReAuthenticationNeeded ? (
        <ReAuthenticateDialog
          onReAuthenticated={onReAuthenticatedCallback}
          cancel={() => {
            setOnReAuthenticatedCallback(
              // eslint-disable-next-line unicorn/consistent-function-scoping
              () => () => setIsReAuthenticationNeeded(false),
            );
            setIsReAuthenticationNeeded(false);
          }}
        />
      ) : null}
      {children}
    </SessionContext.Provider>
  );
}
