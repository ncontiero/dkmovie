import type { Session } from "@/utils/types";
import { createContext } from "react";

export interface SessionContextProps {
  session: Session | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  isLogoutPending: boolean;
  refetchSession: () => void;
  logout: () => void;
}

export const SessionContext = createContext<SessionContextProps>({
  session: null,
  isAuthenticated: false,
  isLoadingSession: true,
  isLogoutPending: false,
  logout: () => {
    throw new Error("logout function not implemented");
  },
  refetchSession: () => {
    throw new Error("refetchSession function not implemented");
  },
});
