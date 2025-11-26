import type { TwoFactorAuthenticatorType } from "@/http/account/2fa";
import { createContext } from "react";

export interface MFAContextProps {
  mFATypes: TwoFactorAuthenticatorType[];
  initializeMFAIfNecessary: (error?: unknown, nextPath?: string) => void;
}

export const MFAContext = createContext<MFAContextProps>({
  mFATypes: [],
  initializeMFAIfNecessary: () => {
    throw new Error("initializeMFAIfNecessary function not implemented");
  },
});
