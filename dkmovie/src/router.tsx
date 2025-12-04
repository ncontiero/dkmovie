import { createRouter, PathParamError } from "@tanstack/react-router";
import { type PageError, lazyComponents } from "./components/lazy-components";
import { queryClient } from "./lib/query";
import { routeTree } from "./routeTree.gen";

// const from Django Template (templates/base.html)
declare const pageError: PageError | null;

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    djangoPageError: pageError,
    auth: undefined!,
    metadataTranslations: undefined!,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: lazyComponents.errors.NotFound,
  defaultPendingComponent: lazyComponents.PendingComponent,
  defaultErrorComponent: ({ error }) => {
    if (error instanceof PathParamError) {
      return <lazyComponents.errors.BadRequest />;
    }

    return <lazyComponents.errors.ServerError />;
  },
  scrollRestoration: true,
  scrollRestorationBehavior: "smooth",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
