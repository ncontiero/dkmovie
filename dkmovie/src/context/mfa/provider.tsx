import type { TwoFactorAuthenticatorType } from "@/http/account/2fa";
import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import { flowsTo2FA, getErrorFlows, need2FA } from "@/utils/auth-flows";
import { type MFAContextProps, MFAContext } from "./context";

interface MFAProviderProps extends PropsWithChildren {
  readonly sessionError: unknown;
}

export function MFAProvider({ sessionError, children }: MFAProviderProps) {
  const navigate = useNavigate();
  const [mfaTypes, setMfaTypes] = useState<TwoFactorAuthenticatorType[]>([]);

  const handleMFATypes = useCallback((error: unknown) => {
    if (need2FA(error)) {
      const flows = getErrorFlows(error);
      const types =
        flows.find((flow) => flowsTo2FA.includes(flow.id))?.types || [];
      setMfaTypes(types as TwoFactorAuthenticatorType[]);
      return;
    }

    setMfaTypes([]);
  }, []);

  const handleMFATypesEvent = useEffectEvent(handleMFATypes);

  useEffect(() => {
    if (sessionError) {
      handleMFATypesEvent(sessionError);
    }
  }, [sessionError]);

  const initializeMFAIfNecessary = useCallback(
    (error?: unknown, nextPath?: string) => {
      const errorToUse = error || sessionError;
      handleMFATypes(errorToUse);
      if (need2FA(errorToUse)) {
        navigate({ to: `/auth/2fa?next=${nextPath}` });
        return;
      }
    },
    [handleMFATypes, navigate, sessionError],
  );

  const contextValues = useMemo(
    (): MFAContextProps => ({ mfaTypes, initializeMFAIfNecessary }),
    [initializeMFAIfNecessary, mfaTypes],
  );

  return <MFAContext value={contextValues}>{children}</MFAContext>;
}
