import { use } from "react";
import { SessionContext } from "@/context/session/context";

export const useSession = () => {
  const context = use(SessionContext);
  if (context === undefined) {
    console.warn("SessionContext is undefined in useSession()");
    throw new Error(`useSession must be used within a SessionContextProvider.`);
  }
  return context;
};
