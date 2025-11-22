import { authAccountHttpClient, HTTPError } from "../client";

type TwoFactorAuthenticatorType = "totp" | "recovery_codes" | "webauthn";

interface Get2FAAuthenticatorBase {
  last_used_at: number;
  created_at: number;
  type: TwoFactorAuthenticatorType;
}
interface Get2FAAuthenticatorTOTP extends Get2FAAuthenticatorBase {}
interface Get2FAAuthenticatorRecoveryCodes extends Get2FAAuthenticatorBase {
  total_code_count: number;
  unused_code_count: number;
}
interface Get2FAAuthenticatorWebAuthn extends Get2FAAuthenticatorBase {
  id: number;
  name: string;
  is_passwordless?: boolean;
}

export interface Get2FAAuthenticatorsResponse {
  data: (
    | Get2FAAuthenticatorTOTP
    | Get2FAAuthenticatorRecoveryCodes
    | Get2FAAuthenticatorWebAuthn
  )[];
}

export async function get2FAAuthenticators() {
  return await authAccountHttpClient.get<Get2FAAuthenticatorsResponse>(
    "/authenticators",
  );
}

interface SetUpTOTPMetaResponse {
  secret: string;
  totp_url: string;
}

export async function setUpTOTP() {
  try {
    await authAccountHttpClient.get("/authenticators/totp");
  } catch (error) {
    if (error instanceof HTTPError && error.status === 404) {
      return error.data?.meta as SetUpTOTPMetaResponse;
    }

    throw error;
  }
}

interface ConfirmTOTPResponse {
  data: Get2FAAuthenticatorTOTP;
}

export async function confirmTOTP(code: string) {
  return await authAccountHttpClient.post<ConfirmTOTPResponse>(
    "/authenticators/totp",
    { code },
  );
}

export async function deleteTOTP() {
  return await authAccountHttpClient.delete("/authenticators/totp");
}

interface GetRecoveryCodes {
  last_used_at: number;
  created_at: number;
  type: "recovery_codes";
  total_code_count: number;
  unused_code_count: number;
  unused_codes: string[];
}
interface GetRecoveryCodesResponse {
  data: GetRecoveryCodes;
}

export async function getRecoveryCodes() {
  return await authAccountHttpClient.get<GetRecoveryCodesResponse>(
    "/authenticators/recovery-codes",
  );
}

export async function regenerateRecoveryCodes() {
  return await authAccountHttpClient.post<GetRecoveryCodesResponse>(
    "/authenticators/recovery-codes",
  );
}
