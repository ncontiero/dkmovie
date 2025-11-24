import type { TwoFactorAuthenticatorType } from "@/http/account/2fa";
import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useEffectEvent,
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
import { flowsTo2FA, getErrorFlows, need2FA } from "@/utils/auth-flows";
import { type SessionContextProps, SessionContext } from "./context";

const protectedRoutes = ["/account", "/account/security"];
const authRoutes = ["/auth/sign-in", "/auth/sign-up", "/auth/2fa"];
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
  const [sessionMFATypes, setSessionMFATypes] = useState<
    TwoFactorAuthenticatorType[]
  >([]);

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
    refetchOnWindowFocus: false,
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

  const handleMFATypes = useCallback((error: unknown) => {
    if (need2FA(error)) {
      const flows = getErrorFlows(error);
      const types =
        flows.find((flow) => flowsTo2FA.includes(flow.id))?.types || [];
      setSessionMFATypes(types as TwoFactorAuthenticatorType[]);
      return;
    }

    setSessionMFATypes([]);
  }, []);

  const handleMFATypesEvent = useEffectEvent(handleMFATypes);

  useEffect(() => {
    if (sessionError) {
      handleMFATypesEvent(sessionError);
    }
  }, [handleMFATypes, sessionError]);

  const initialize2FAIfNecessary = useCallback(
    (error?: unknown, nextPath?: string) => {
      const errorToUse = error || sessionError;
      handleMFATypes(errorToUse);
      if (need2FA(errorToUse)) {
        navigate(`/auth/2fa?next=${nextPath}`);
        return;
      }

      if (pathname.startsWith("/auth/2fa")) {
        navigate(isAuthenticated ? "/account" : signInRoute);
      }
    },
    [handleMFATypes, isAuthenticated, navigate, pathname, sessionError],
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
      sessionMFATypes,
      isAuthenticated,
      isLoadingSession,
      logout: logoutMutation,
      setSession,
      initializeReAuthentication,
      isReAuthenticating: isReAuthenticationNeeded,
      initialize2FAIfNecessary,
    }),
    [
      initialize2FAIfNecessary,
      initializeReAuthentication,
      isAuthenticated,
      isLoadingSession,
      isReAuthenticationNeeded,
      logoutMutation,
      session?.data,
      sessionMFATypes,
      setSession,
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
