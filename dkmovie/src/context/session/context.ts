import type { CurrentSessionResponse } from "@/http/auth/session";
import type { Session } from "@/utils/types";
import { createContext } from "react";

export interface SessionContextProps {
  session: Session | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  setSession: (newSession?: CurrentSessionResponse | null) => void;
  logout: () => void;
}

export const SessionContext = createContext<SessionContextProps>({
  session: null,
  isAuthenticated: false,
  isLoadingSession: true,
  logout: () => {
    throw new Error("logout function not implemented");
  },
  setSession: () => {
    throw new Error("setSession function not implemented");
  },
});
