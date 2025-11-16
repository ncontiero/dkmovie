import { lazy } from "react";
import { Route, Routes } from "react-router";

const lazyComponentMap = {
  home: lazy(() => import("./pages/home")),
  title: lazy(() => import("./pages/title")),
  signUp: lazy(() => import("./pages/sign-up")),
  signIn: lazy(() => import("./pages/sign-in")),
  notFound: lazy(() => import("./pages/404")),
};

export function Router() {
  return (
    <Routes>
      <Route index Component={lazyComponentMap.home} />
      <Route path="/title/:id" Component={lazyComponentMap.title} />
      <Route path="/sign-up" Component={lazyComponentMap.signUp} />
      <Route path="/sign-in" Component={lazyComponentMap.signIn} />
      <Route path="*" Component={lazyComponentMap.notFound} />
    </Routes>
  );
}
