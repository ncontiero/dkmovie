import type { AddPasskeySchema } from "@/schemas/account/passkey";
import { authAccountHttpClient } from "../client";

export interface GetWebAuthnCredentialResponse {
  data: {
    creation_options: { publicKey: PublicKeyCredentialCreationOptionsJSON };
  };
}

export async function getWebAuthCredentials(passwordless: boolean = true) {
  const searchParam = passwordless ? "?passwordless=true" : "";
  return await authAccountHttpClient.get<GetWebAuthnCredentialResponse>(
    `/authenticators/webauthn${searchParam}`,
  );
}

interface AddWebAuthCredentialsResponse {
  meta: {
    recovery_codes_generated?: boolean;
  };
}

export async function addWebAuthCredentials(
  credential: unknown,
  data: AddPasskeySchema,
) {
  return await authAccountHttpClient.post<AddWebAuthCredentialsResponse>(
    "/authenticators/webauthn",
    {
      credential,
      ...data,
    },
  );
}

export async function deleteWebAuthCredentials(ids: number[]) {
  return await authAccountHttpClient.delete("/authenticators/webauthn", {
    authenticators: ids,
  });
}

export async function renameWebAuthCredentials(
  id: number,
  data: AddPasskeySchema,
) {
  return await authAccountHttpClient.put("/authenticators/webauthn", {
    id,
    ...data,
  });
}
