import type { BaseSyntheticEvent, PropsWithChildren } from "react";
import { Link } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import { PasskeyAuthButton } from "./passkey-auth-button";
import { ProviderButton } from "./provider-button";

interface BaseAuthFormProps extends PropsWithChildren {
  readonly formSubmit: (e?: BaseSyntheticEvent) => Promise<void>;
  readonly title: string;
  readonly description: string;
  readonly isAuthenticated?: boolean;
  readonly type?:
    | "sign-in"
    | "sign-up"
    | "verify-email"
    | "forgot-password"
    | "reset-password"
    | "2fa";
}

export function BaseAuthForm({
  children,
  formSubmit,
  title,
  description,
  isAuthenticated = false,
  type = "sign-in",
}: BaseAuthFormProps) {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg border shadow-lg">
        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-muted-foreground text-sm font-medium">
              {description}
            </p>
          </div>
          {type === "sign-in" || type === "sign-up" ? (
            <>
              <div className="flex flex-col items-center justify-center gap-2">
                <ProviderButton className="w-full" />
                {type === "sign-in" && <PasskeyAuthButton className="w-full" />}
              </div>
              <div className="text-muted-foreground flex items-center justify-center text-sm">
                <Separator className="flex-1" />
                <p className="mx-3">Or {type} in with</p>
                <Separator className="flex-1" />
              </div>
            </>
          ) : (
            <Separator />
          )}
          <form onSubmit={formSubmit} className="space-y-6">
            {children}
          </form>
          {type === "forgot-password" && !isAuthenticated ? (
            <>
              <div className="flex items-center justify-center">
                <Separator className="flex-1" />
                <p className="text-muted-foreground mx-3 text-sm">
                  Or, sign in with another method
                </p>
                <Separator className="flex-1" />
              </div>
              <div className="flex flex-col items-center justify-center gap-2">
                <ProviderButton className="w-full" />
                <PasskeyAuthButton className="w-full" />
              </div>
            </>
          ) : null}
        </div>
        {!isAuthenticated && type !== "2fa" && type !== "verify-email" && (
          <div className="border-t px-9 py-4">
            {type === "sign-in" ? (
              <p className="text-muted-foreground text-center text-sm font-medium">
                Don&apos;t have an account?{" "}
                <Link to="/auth/sign-up" size="sm">
                  Sign up
                </Link>
              </p>
            ) : type === "sign-up" ? (
              <p className="text-muted-foreground text-center text-sm font-medium">
                Already have an account?{" "}
                <Link to="/auth/sign-in" size="sm">
                  Sign in
                </Link>
              </p>
            ) : type === "forgot-password" ? (
              <p className="text-muted-foreground text-center text-sm font-medium">
                Remember your password?{" "}
                <Link to="/auth/sign-in" size="sm">
                  Sign in
                </Link>
              </p>
            ) : type === "reset-password" ? (
              <p className="text-muted-foreground text-center text-sm font-medium">
                Go back to{" "}
                <Link to="/auth/sign-in" size="sm">
                  Sign in
                </Link>
              </p>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}
