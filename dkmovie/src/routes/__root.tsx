import type { QueryClient } from "@tanstack/react-query";
import type { SessionContextProps } from "@/context/session/context";
import { useEffect } from "react";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  useMatch,
} from "@tanstack/react-router";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { type PageError, lazyComponents } from "@/components/lazy-components";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MFAProvider } from "@/context/mfa/provider";
import { rootSearchSchema } from "@/schemas/routes/base";
import { type MetadataTranslations, generateMetadata } from "@/utils/metadata";

interface RouterContext {
  queryClient: QueryClient;
  djangoPageError: PageError | null;
  djangoAdminUrl: string;
  auth: SessionContextProps;
  metadataTranslations: MetadataTranslations;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  validateSearch: rootSearchSchema,
  head: ({
    match: {
      context: { metadataTranslations, djangoPageError },
    },
    matches,
  }) => {
    let errorTitle = undefined;
    if (djangoPageError) {
      errorTitle = metadataTranslations(`errors.${djangoPageError}`);
    }

    const haveSearchOrParamsErrors = matches.some(
      (match) => match.searchError || match.paramsError,
    );
    if (haveSearchOrParamsErrors) {
      errorTitle = metadataTranslations("errors.BadRequest");
    }

    return generateMetadata({
      metadataTranslations,
      isOnlyBase: true,
      overrideTitle: !errorTitle,
      title: errorTitle,
    });
  },
});

function RootComponent() {
  const {
    djangoPageError,
    auth: { sessionError },
  } = Route.useRouteContext();
  const PageError = djangoPageError && lazyComponents.errors[djangoPageError];

  const isOnWatchPage = !!useMatch({
    from: "/title/$titleId/watch",
    shouldThrow: false,
  });

  useEffect(() => {
    document.querySelector("#pageErrorScript")?.remove();
    document.querySelector("#adminConfigScript")?.remove();
  }, []);

  return (
    <MFAProvider sessionError={sessionError}>
      <HeadContent />
      <TooltipProvider delayDuration={100}>
        {!isOnWatchPage && <Header />}
        {PageError ? <PageError /> : <Outlet />}
        {!isOnWatchPage && <Footer />}
      </TooltipProvider>
      <Toaster />
    </MFAProvider>
  );
}
