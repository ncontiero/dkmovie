import { createContext } from "react";

export interface ReAuthenticationProps {
  onReAuthenticated: () => void;
  onCancel: () => void;
}
export interface InitializeReAuthenticationProps
  extends Partial<ReAuthenticationProps> {}

export type InitializeReAuthentication = (
  props: InitializeReAuthenticationProps,
) => void;

export interface ReAuthenticateContextProps {
  isReAuthenticating: boolean;
  initializeReAuthentication: InitializeReAuthentication;
}

export const ReAuthenticateContext = createContext<ReAuthenticateContextProps>({
  isReAuthenticating: false,
  initializeReAuthentication: () => {
    throw new Error("initializeReAuthentication function not implemented");
  },
});
