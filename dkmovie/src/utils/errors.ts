import { HTTPError } from "@/http/client";

export function isHttpError(error: unknown) {
  return error instanceof HTTPError;
}

export function isHttpBadRequest(error: unknown) {
  if (!isHttpError(error)) return false;
  return error.status === 400;
}

export function isHttpUnauthorized(error: unknown) {
  if (!isHttpError(error)) return false;
  return error.status === 401;
}

export function isHttpForbidden(error: unknown) {
  if (!isHttpError(error)) return false;
  return error.status === 403;
}

export function isHttpNotFound(error: unknown) {
  if (!isHttpError(error)) return false;
  return error.status === 404;
}

export function isHttpConflict(error: unknown) {
  if (!isHttpError(error)) return false;
  return error.status === 409;
}

export function isHttpTooManyRequests(error: unknown) {
  if (!isHttpError(error)) return false;
  return error.status === 429;
}

export function getErrorMessage(error: unknown) {
  if (isHttpError(error)) {
    if (error.data?.message) return error.data.message as string;
    if (isHttpBadRequest(error)) {
      const errors = error.data?.errors?.map((e: any) => e.message) || [];
      if (errors.length === 0) return;
      return errors.join(". ") as string;
    }
  }

  return;
}
