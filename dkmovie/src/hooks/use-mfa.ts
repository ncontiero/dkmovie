import { useContext } from "react";
import { MFAContext } from "@/context/mfa/context";

export const useMFA = () => {
  const context = useContext(MFAContext);
  if (context === undefined) {
    console.warn("MFAContext is undefined in useMFA()");
    throw new Error(`useMFA must be used within a MFAProvider.`);
  }
  return context;
};
