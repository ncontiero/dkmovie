import { use } from "react";
import { ReAuthenticateContext } from "@/context/reauthenticate/context";

export const useReAuthenticate = () => {
  const context = use(ReAuthenticateContext);
  if (context === undefined) {
    console.warn("ReAuthenticateContext is undefined in useReAuthenticate()");
    throw new Error(
      `useReAuthenticate must be used within a ReAuthenticateProvider.`,
    );
  }
  return context;
};
