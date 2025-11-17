import { useContext } from "react";
import { SessionContext } from "@/context/session/context";

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    console.warn("SessionContext is undefined in useSession()");
    throw new Error(`useSession must be used within a SessionContextProvider.`);
  }
  return context;
};
