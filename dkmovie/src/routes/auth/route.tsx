import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

const pathsToRedirect = ["/auth/sign-in", "/auth/sign-up", "/auth/2fa"];

export const Route = createFileRoute("/auth")({
  component: AuthLayoutComponent,
  beforeLoad: ({ context: { auth }, search, location: { pathname } }) => {
    const isPathToRedirect = pathsToRedirect.some((path) =>
      pathname.startsWith(path),
    );
    if (auth.isAuthenticated && isPathToRedirect) {
      throw redirect({ to: search.next || "/" });
    }
  },
});

function AuthLayoutComponent() {
  return <Outlet />;
}
