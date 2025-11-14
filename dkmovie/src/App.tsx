import { Suspense, useEffect } from "react";
import { BrowserRouter } from "react-router";
import { Header } from "./components/header";
import { LoadingPage } from "./components/loading-page";
import { Router } from "./routes";

export function App() {
  useEffect(() => {
    document.documentElement.classList.remove("opacity-0");
  }, []);

  return (
    <BrowserRouter>
      <Header />
      <Suspense fallback={<LoadingPage />}>
        <Router />
      </Suspense>
    </BrowserRouter>
  );
}
