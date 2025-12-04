import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { useTranslations } from "use-intl";
import { lazyComponents } from "./components/lazy-components";
import { IntlProvider } from "./context/intl/provider";
import { SessionProvider } from "./context/session/provider";
import { useSession } from "./hooks/use-session";
import { router } from "./router";

function InnerApp() {
  const auth = useSession();
  const t = useTranslations("metadata");

  if (auth.isLoadingSession) {
    return <lazyComponents.PendingComponent />;
  }

  return (
    <RouterProvider
      router={router}
      context={{ auth, metadataTranslations: t }}
    />
  );
}

export function App() {
  const routerContext = router.options.context;

  useEffect(() => {
    document.documentElement.classList.remove("opacity-0");
  }, []);

  return (
    <QueryClientProvider client={routerContext.queryClient}>
      <IntlProvider>
        <SessionProvider>
          <InnerApp />
        </SessionProvider>
      </IntlProvider>
    </QueryClientProvider>
  );
}
