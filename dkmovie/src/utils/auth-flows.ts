import { HTTPError } from "@/http/client";

interface Flow {
  id: string;
  is_pending?: boolean;
}

const flowsToReauthenticate = ["reauthenticate", "mfa_reauthenticate"];
const flowsTo2FA = ["mfa_authenticate"];

export function getErrorFlows(error: Error | unknown): Flow[] {
  if (error instanceof HTTPError && error.status === 401) {
    return error.data?.data?.flows || [];
  }
  return [];
}

export function needReAuthentication(error: Error | unknown) {
  const flows = getErrorFlows(error);
  if (flows.some((flow: Flow) => flowsToReauthenticate.includes(flow.id))) {
    return true;
  }
  return false;
}

export function need2FA(error: Error | unknown) {
  const flows = getErrorFlows(error);
  const isNeeded = flows.some(
    (flow: Flow) => flowsTo2FA.includes(flow.id) && flow.is_pending,
  );
  if (isNeeded) return true;
  return false;
}

export function needEmailVerification(error: Error | unknown) {
  const flows = getErrorFlows(error);
  const isNeeded = flows.some(
    (flow: Flow) => flow.id === "verify_email" && flow.is_pending,
  );
  if (isNeeded) return true;
  return false;
}
