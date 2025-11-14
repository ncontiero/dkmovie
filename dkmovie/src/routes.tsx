import { lazy } from "react";
import { Route, Routes } from "react-router";

const lazyComponentMap = {
  home: lazy(() => import("./pages/home")),
  notFound: lazy(() => import("./pages/404")),
};

export function Router() {
  return (
    <Routes>
      <Route index Component={lazyComponentMap.home} />
      <Route path="*" Component={lazyComponentMap.notFound} />
    </Routes>
  );
}
