import { lazy, useEffect } from "react";
import { Route, Routes } from "react-router";

const lazyComponentMap = {
  home: lazy(() => import("./pages/home")),
  title: lazy(() => import("./pages/title")),
  auth: {
    signUp: lazy(() => import("./pages/auth/sign-up")),
    signIn: lazy(() => import("./pages/auth/sign-in")),
    mfa: {
      index: lazy(() => import("./pages/auth/2fa")),
      totp: lazy(() => import("./pages/auth/2fa/totp")),
      recoveryCodes: lazy(() => import("./pages/auth/2fa/recovery-codes")),
    },
    forgotPassword: lazy(() => import("./pages/auth/password/forgot-password")),
    resetPassword: lazy(() => import("./pages/auth/password/reset-password")),
  },
  account: {
    myAccountLayout: lazy(
      () => import("./pages/account/my-account/my-account-layout"),
    ),
    myAccount: lazy(() => import("./pages/account/my-account")),
    security: lazy(() => import("./pages/account/my-account/security-page")),
    verifyEmail: lazy(() => import("./pages/account/verify-email")),
    providerCallback: lazy(() => import("./pages/account/provider/callback")),
  },
  error: {
    notFound: lazy(() => import("./pages/error/404")),
    badRequest: lazy(() => import("./pages/error/400")),
    forbidden: lazy(() => import("./pages/error/403")),
    serverError: lazy(() => import("./pages/error/500")),
  },
};

type ErrorPage = keyof typeof lazyComponentMap.error;
declare const pageError: ErrorPage | null;

export function Router() {
  const PageError = pageError && lazyComponentMap.error[pageError];

  useEffect(() => {
    document.querySelector("#pageErrorScript")?.remove();
  }, []);

  return (
    <Routes>
      {PageError ? <Route path="*" element={<PageError />} /> : null}
      <Route index Component={lazyComponentMap.home} />
      <Route path="/title/:id" Component={lazyComponentMap.title} />
      <Route path="/auth">
        <Route path="sign-up" Component={lazyComponentMap.auth.signUp} />
        <Route path="sign-in" Component={lazyComponentMap.auth.signIn} />
        <Route path="2fa">
          <Route index Component={lazyComponentMap.auth.mfa.index} />
          <Route path="totp" Component={lazyComponentMap.auth.mfa.totp} />
          <Route
            path="recovery-codes"
            Component={lazyComponentMap.auth.mfa.recoveryCodes}
          />
        </Route>
        <Route path="password">
          <Route
            path="forgot"
            Component={lazyComponentMap.auth.forgotPassword}
          />
          <Route path="reset" Component={lazyComponentMap.auth.resetPassword} />
        </Route>
      </Route>
      <Route path="/account">
        <Route Component={lazyComponentMap.account.myAccountLayout}>
          <Route index Component={lazyComponentMap.account.myAccount} />
          <Route
            path="security"
            Component={lazyComponentMap.account.security}
          />
        </Route>
        <Route
          path="verify-email"
          Component={lazyComponentMap.account.verifyEmail}
        />
        <Route
          path="provider/callback"
          Component={lazyComponentMap.account.providerCallback}
        />
      </Route>
      <Route path="*" Component={lazyComponentMap.error.notFound} />
    </Routes>
  );
}
