import { lazy } from "react";
import { Route, Routes } from "react-router";

const lazyComponentMap = {
  home: lazy(() => import("./pages/home")),
  title: lazy(() => import("./pages/title")),
  auth: {
    signUp: lazy(() => import("./pages/auth/sign-up")),
    signIn: lazy(() => import("./pages/auth/sign-in")),
    forgotPassword: lazy(() => import("./pages/auth/password/forgot-password")),
    resetPassword: lazy(() => import("./pages/auth/password/reset-password")),
  },
  account: {
    myAccount: lazy(() => import("./pages/account/my-account")),
    verifyEmail: lazy(() => import("./pages/account/verify-email")),
    providerCallback: lazy(() => import("./pages/account/provider/callback")),
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
        <Route path="password">
          <Route
            path="forgot"
            Component={lazyComponentMap.auth.forgotPassword}
          />
          <Route
            path="reset/:key"
            Component={lazyComponentMap.auth.resetPassword}
          />
        </Route>
      </Route>
      <Route path="/account">
        <Route index Component={lazyComponentMap.account.myAccount} />
        <Route
          path="verify-email/:key"
          Component={lazyComponentMap.account.verifyEmail}
        />
        <Route
          path="provider/callback"
          Component={lazyComponentMap.account.providerCallback}
        />
      </Route>
      <Route path="*" Component={lazyComponentMap.notFound} />
    </Routes>
  );
}
