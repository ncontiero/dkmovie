import { type PropsWithChildren, useCallback, useMemo, useState } from "react";
import { ReAuthenticateDialog } from "@/components/reauthenticate";
import {
  type InitializeReAuthentication,
  type InitializeReAuthenticationProps,
  type ReAuthenticateContextProps,
  ReAuthenticateContext,
} from "./context";

export function ReAuthenticateProvider({ children }: PropsWithChildren) {
  const [isReAuthenticationNeeded, setIsReAuthenticationNeeded] =
    useState(false);
  const [reAuthenticationCallbacks, setReAuthenticationCallbacks] =
    useState<InitializeReAuthenticationProps>();

  const initializeReAuthentication: InitializeReAuthentication = useCallback(
    ({ onReAuthenticated, onCancel }) => {
      setIsReAuthenticationNeeded(true);
      setReAuthenticationCallbacks({ onReAuthenticated, onCancel });
    },
    [],
  );

  const contextValues = useMemo(
    (): ReAuthenticateContextProps => ({
      isReAuthenticating: isReAuthenticationNeeded,
      initializeReAuthentication,
    }),
    [isReAuthenticationNeeded, initializeReAuthentication],
  );

  return (
    <ReAuthenticateContext.Provider value={contextValues}>
      {isReAuthenticationNeeded ? (
        <ReAuthenticateDialog
          onReAuthenticated={() => {
            setIsReAuthenticationNeeded(false);
            reAuthenticationCallbacks?.onReAuthenticated?.();
          }}
          onCancel={() => {
            setIsReAuthenticationNeeded(false);
            reAuthenticationCallbacks?.onCancel?.();
          }}
        />
      ) : null}
      {children}
    </ReAuthenticateContext.Provider>
  );
}
