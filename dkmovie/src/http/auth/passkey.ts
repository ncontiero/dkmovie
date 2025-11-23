import type { CurrentSessionResponse } from "./session";
import { authHttpClient } from "../client";

export interface GetWebAuthnCredentialResponse {
  data: {
    request_options: { publicKey: PublicKeyCredentialCreationOptionsJSON };
  };
}

export type GetWebAuthnRequestType = "login" | "reauthenticate" | "2fa";

export async function getWebAuthnCredentials(
  type: GetWebAuthnRequestType = "login",
) {
  return await authHttpClient.get<GetWebAuthnCredentialResponse>(
    `/webauthn/${type === "2fa" ? "authenticate" : type}`,
  );
}

export async function authenticateWithWebAuthn(
  type: GetWebAuthnRequestType = "login",
  credential: unknown,
) {
  return await authHttpClient.post<CurrentSessionResponse>(
    `/webauthn/${type === "2fa" ? "authenticate" : type}`,
    { credential },
  );
}
