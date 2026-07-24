import type { TwoFactorAuthenticatorType } from "@/http/account/2fa";
import { createContext } from "react";

export interface MFAContextProps {
  mfaTypes: TwoFactorAuthenticatorType[];
  initializeMFAIfNecessary: (error?: unknown, nextPath?: string) => void;
}

export const MFAContext = createContext<MFAContextProps>({
  mfaTypes: [],
  initializeMFAIfNecessary: () => {
    throw new Error("initializeMFAIfNecessary function not implemented");
  },
});
