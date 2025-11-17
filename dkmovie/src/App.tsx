import { Suspense, useEffect } from "react";
import { BrowserRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { LoadingPage } from "./components/loading-page";
import { Toaster } from "./components/ui/sonner";
import { SessionProvider } from "./context/session/provider";
import { queryClient } from "./lib/query";
import { Router } from "./routes";

export function App() {
  useEffect(() => {
    document.documentElement.classList.remove("opacity-0");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <Header />
            <Toaster />
            <Suspense fallback={<LoadingPage />}>
              <Router />
            </Suspense>
            <Footer />
          </ThemeProvider>
        </SessionProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
