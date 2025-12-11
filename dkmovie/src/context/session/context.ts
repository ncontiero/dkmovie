import type { CurrentSessionResponse } from "@/http/auth/session";
import type { Session } from "@/utils/types";
import { createContext } from "react";

export interface SessionContextProps {
  session: Session | null;
  sessionError: Error | null;
  isAuthenticated: boolean;
  isSuperUser: boolean;
  isLoadingSession: boolean;
  setSession: (newSession?: CurrentSessionResponse | null) => void;
  logout: () => void;
}

export const SessionContext = createContext<SessionContextProps>({
  session: null,
  sessionError: null,
  isAuthenticated: false,
  isSuperUser: false,
  isLoadingSession: true,
  setSession: () => {
    throw new Error("setSession function not implemented");
  },
  logout: () => {
    throw new Error("logout function not implemented");
  },
});
