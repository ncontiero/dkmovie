import type { ElementType } from "react";
import { Link } from "react-router";
import { useTranslations } from "use-intl";
import { Meta } from "./meta";
import { Button } from "./ui/button";

interface PageErrorProps {
  readonly code: number;
  readonly title: string;
  readonly description: string;
  readonly Icon: ElementType;
}

export function PageError({ code, title, description, Icon }: PageErrorProps) {
  const t = useTranslations("pageError");

  return (
    <div
      className={`bg-background text-foreground flex min-h-screen flex-col items-center justify-center text-center`}
    >
      <Meta title={title} />
      <div className="mb-6">
        <Icon className="text-destructive size-16" />
      </div>

      <h1 className="text-foreground mb-4 text-6xl font-extrabold md:text-8xl">
        {code}
      </h1>

      <h2 className="text-foreground mb-3 text-2xl font-semibold md:text-3xl">
        {title}
      </h2>

      <p className="text-muted-foreground mb-8 max-w-md text-lg">
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
