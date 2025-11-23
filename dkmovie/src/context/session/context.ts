import type { TwoFactorAuthenticatorType } from "@/http/account/2fa";
import type { CurrentSessionResponse } from "@/http/auth/session";
import type { Session } from "@/utils/types";
import { createContext } from "react";

export interface SessionContextProps {
  session: Session | null;
  sessionMFATypes: TwoFactorAuthenticatorType[];
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  isReAuthenticating: boolean;
  setSession: (newSession?: CurrentSessionResponse | null) => void;
  logout: () => void;
  initializeReAuthentication: (callback?: () => void) => void;
  initialize2FAIfNecessary: (error?: unknown) => void;
}

export const SessionContext = createContext<SessionContextProps>({
  session: null,
  sessionMFATypes: [],
  isAuthenticated: false,
  isLoadingSession: true,
  isReAuthenticating: false,
  setSession: () => {
    throw new Error("setSession function not implemented");
  },
  logout: () => {
    throw new Error("logout function not implemented");
  },
  initializeReAuthentication: () => {
    throw new Error("initializeReAuthentication function not implemented");
  },
  initialize2FAIfNecessary: () => {
    throw new Error("initialize2FAIfNecessary function not implemented");
  },
});
