import type { BaseSyntheticEvent, PropsWithChildren } from "react";
import { Link } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import { GoogleProvider } from "./providers/google";

interface BaseAuthFormProps extends PropsWithChildren {
  readonly isSignIn?: boolean;
  readonly formSubmit: (e?: BaseSyntheticEvent) => Promise<void>;
  readonly title: string;
  readonly description: string;
  readonly isAuthenticated?: boolean;
}

export function BaseAuthForm({
  children,
  formSubmit,
  title,
  description,
  isSignIn = true,
  isAuthenticated = false,
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
          <div className="flex items-center justify-center">
            <GoogleProvider />
          </div>
          <div className="text-muted-foreground flex items-center justify-center text-sm">
            <Separator className="shrink" />
            <p className="mx-3">Or</p>
            <Separator className="shrink" />
          </div>
          <form onSubmit={formSubmit} className="space-y-6">
            {children}
          </form>
        </div>
        {!isAuthenticated && (
          <div className="border-t px-9 py-4">
            {isSignIn ? (
              <p className="text-muted-foreground text-center text-sm font-medium">
                Don&apos;t have an account?{" "}
                <Link to="/auth/sign-up" size="sm">
                  Sign up
                </Link>
              </p>
            ) : (
              <p className="text-muted-foreground text-center text-sm font-medium">
                Already have an account?{" "}
                <Link to="/auth/sign-in" size="sm">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
