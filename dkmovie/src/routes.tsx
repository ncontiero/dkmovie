import { lazy } from "react";
import { Route, Routes } from "react-router";

const lazyComponentMap = {
  home: lazy(() => import("./pages/home")),
  title: lazy(() => import("./pages/title")),
  auth: {
    signUp: lazy(() => import("./pages/sign-up")),
    signIn: lazy(() => import("./pages/sign-in")),
    forgotPassword: lazy(() => import("./pages/forgot-password")),
    resetPassword: lazy(() => import("./pages/password-reset")),
  },
  account: {
    verifyEmail: lazy(() => import("./pages/verify-email")),
    myAccount: lazy(() => import("./pages/my-account")),
  },
  notFound: lazy(() => import("./pages/404")),
};

export function Router() {
  return (
    <Routes>
      <Route index Component={lazyComponentMap.home} />
      <Route path="/title/:id" Component={lazyComponentMap.title} />
      <Route path="/auth">
        <Route path="sign-up" Component={lazyComponentMap.auth.signUp} />
        <Route path="sign-in" Component={lazyComponentMap.auth.signIn} />
        <Route
          path="forgot-password"
          Component={lazyComponentMap.auth.forgotPassword}
        />
        <Route
          path="password/reset/:key"
          Component={lazyComponentMap.auth.resetPassword}
        />
      </Route>
      <Route path="/account">
        <Route index Component={lazyComponentMap.account.myAccount} />
        <Route
          path="verify-email/:key"
          Component={lazyComponentMap.account.verifyEmail}
        />
      </Route>
      <Route path="*" Component={lazyComponentMap.notFound} />
    </Routes>
  );
}
