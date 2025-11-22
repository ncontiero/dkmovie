import { HTTPError } from "@/http/client";

interface Flow {
  id: string;
  is_pending?: boolean;
}

const flowsToReauthenticate = ["reauthenticate", "mfa_reauthenticate"];
const flowsTo2FA = ["mfa_authenticate"];

export function needReAuthentication(error: Error | unknown) {
  if (error instanceof HTTPError && error.status === 401) {
    const flows: Flow[] = error.data?.data?.flows || [];
    if (flows.some((flow: Flow) => flowsToReauthenticate.includes(flow.id))) {
      return true;
    }
  }
  return false;
}

export function need2FA(error: Error | unknown) {
  if (error instanceof HTTPError && error.status === 401) {
    const flows: Flow[] = error.data?.data?.flows || [];
    if (
      flows.some(
        (flow: Flow) => flowsTo2FA.includes(flow.id) && flow.is_pending,
      )
    ) {
      return true;
    }
  }
  return false;
}
