import type { QueryClient } from "@tanstack/react-query";
import type { SessionContextProps } from "@/context/session/context";
import { useEffect } from "react";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from "@tanstack/react-router";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { type PageError, lazyComponents } from "@/components/lazy-components";
import { Toaster } from "@/components/ui/sonner";
import { MFAProvider } from "@/context/mfa/provider";
import { nextPathSearchSchema } from "@/schemas/routes/base";
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
  validateSearch: (search) => nextPathSearchSchema.parse(search),
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

  useEffect(() => {
    document.querySelector("#pageErrorScript")?.remove();
    document.querySelector("#adminConfigScript")?.remove();
  }, []);

  return (
    <MFAProvider sessionError={sessionError}>
      <HeadContent />
      <Header />
      {PageError ? <PageError /> : <Outlet />}
      <Footer />
      <Toaster />
    </MFAProvider>
  );
}
