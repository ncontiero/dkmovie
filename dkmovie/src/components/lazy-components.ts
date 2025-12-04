import { lazyRouteComponent } from "@tanstack/react-router";

export const lazyComponents = {
  PendingComponent: lazyRouteComponent(
    () => import("@/components/pending-component"),
    "PendingComponent",
  ),
  errors: {
    NotFound: lazyRouteComponent(
      () => import("@/components/errors/404"),
      "NotFoundComponent",
    ),
    BadRequest: lazyRouteComponent(
      () => import("@/components/errors/400"),
      "BadRequestComponent",
    ),
    Forbidden: lazyRouteComponent(
      () => import("@/components/errors/403"),
      "ForbiddenComponent",
    ),
    ServerError: lazyRouteComponent(
      () => import("@/components/errors/500"),
      "InternalServerErrorComponent",
    ),
  },
};

export type PageError = keyof typeof lazyComponents.errors;
