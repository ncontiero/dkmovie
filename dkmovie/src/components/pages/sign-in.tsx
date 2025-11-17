import type { BaseSyntheticEvent, PropsWithChildren } from "react";
import { Meta } from "@/components/meta";
import { Link } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";

interface BasePageForSignInProps extends PropsWithChildren {
  readonly isSignIn?: boolean;
  readonly formSubmit: (e?: BaseSyntheticEvent) => Promise<void>;
  readonly title: string;
  readonly description: string;
}

export function BasePageForSignIn({
  children,
  formSubmit,
  title,
  description,
  isSignIn = true,
}: BasePageForSignInProps) {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Meta title={title} />
      <form
        className="w-full max-w-md rounded-lg border shadow-lg"
        onSubmit={formSubmit}
      >
        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-muted-foreground text-sm font-medium">
              {description}
            </p>
          </div>
          <Separator />
          {children}
        </div>
        <div className="border-t px-9 py-4">
          {isSignIn ? (
            <p className="text-muted-foreground text-center text-sm font-medium">
              Don&apos;t have an account?{" "}
              <Link to="/sign-up" size="sm">
                Sign up
              </Link>
            </p>
          ) : (
            <p className="text-muted-foreground text-center text-sm font-medium">
              Already have an account?{" "}
              <Link to="/sign-in" size="sm">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </form>
    </main>
  );
}
