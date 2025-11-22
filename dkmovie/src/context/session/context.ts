import type { CurrentSessionResponse } from "@/http/auth/session";
import type { Session } from "@/utils/types";
import { createContext } from "react";

export interface SessionContextProps {
  session: Session | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  isReAuthenticating: boolean;
  setSession: (newSession?: CurrentSessionResponse | null) => void;
  logout: () => void;
  initializeReAuthentication: (callback?: () => void) => void;
}

export const SessionContext = createContext<SessionContextProps>({
  session: null,
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
});
