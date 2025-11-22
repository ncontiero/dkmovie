import { HTTPError } from "@/http/client";

interface Flow {
  id: string;
}

const flowsToReauthenticate = ["reauthenticate", "mfa_reauthenticate"];

export function needReAuthentication(error: Error | unknown) {
  if (error instanceof HTTPError && error.status === 401) {
    const flows: Flow[] = error.data?.data?.flows || [];
    if (flows.some((flow: Flow) => flowsToReauthenticate.includes(flow.id))) {
      return true;
    }
  }
  return false;
}
