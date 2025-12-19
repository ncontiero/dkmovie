import type { CurrentSessionResponse } from "@/http/auth/session";
import type { Session, User } from "@/utils/types";
import { createContext } from "react";

export interface SessionContextProps {
  session: Session | null;
  user: User | null;
  sessionError: Error | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  setSession: (newSession?: CurrentSessionResponse | null) => void;
  logout: () => void;
}

export const SessionContext = createContext<SessionContextProps>({
  session: null,
  user: null,
  sessionError: null,
  isAuthenticated: false,
  isLoadingSession: true,
  setSession: () => {
    throw new Error("setSession function not implemented");
  },
  logout: () => {
    throw new Error("logout function not implemented");
  },
});
