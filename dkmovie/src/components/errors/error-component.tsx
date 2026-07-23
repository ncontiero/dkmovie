import { type ElementType, useEffect } from "react";
import {
  Link,
  useLocation,
  useRouteContext,
  useRouter,
} from "@tanstack/react-router";
import { useTranslations } from "use-intl";
import { Button } from "../ui/button";

interface PageErrorProps {
  readonly code: number;
  readonly title: string;
  readonly description: string;
  readonly Icon: ElementType;
}

export function PageError({ code, title, description, Icon }: PageErrorProps) {
  const { update } = useRouter();
  const context = useRouteContext({ from: "__root__" });
  const { pathname } = useLocation();
  const t = useTranslations("pageError");

  useEffect(() => {
    update({ context: { ...context, djangoPageError: null } });
  }, [context, update, pathname]);

  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center bg-background text-center text-foreground`}
    >
      <div className="mb-6">
        <Icon className="size-16 text-destructive" />
      </div>

      <h1 className="mb-4 text-6xl font-extrabold text-foreground md:text-8xl">
        {code}
      </h1>

      <h2 className="mb-3 text-2xl font-semibold text-foreground md:text-3xl">
        {title}
      </h2>

      <p className="mb-8 max-w-md text-lg text-muted-foreground">
        {description}
      </p>

      <div>
        <Button
          asChild
          size="lg"
          className="font-semibold shadow-lg transition-all hover:scale-105"
        >
          <Link to="/">{t("return")}</Link>
        </Button>
      </div>
    </div>
  );
}
