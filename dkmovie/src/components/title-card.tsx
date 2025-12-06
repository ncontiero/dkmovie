import type { Title } from "@/utils/types";
import { Link } from "@tanstack/react-router";
import { Play, Plus } from "lucide-react";
import { useTranslations } from "use-intl";
import { Button } from "./ui/button";

interface TitleCardProps {
  readonly title: Title;
}

export function TitleCard({ title }: TitleCardProps) {
  const t = useTranslations("titlePage");

  return (
    <div className="group relative shrink-0 transform rounded-lg focus-visible:outline-hidden">
      <div
        className={`
          ring-ring ring-offset-background overflow-hidden rounded-lg ring-offset-2 duration-300 group-hover:scale-105
          not-focus-within:group-hover:-translate-y-2 group-focus-visible:scale-105 group-focus-visible:ring-2
          focus-within:scale-105 focus-within:ring-2
        `}
      >
        {title.poster ? (
          <img
            src={title.poster}
            alt={title.title}
            className={`
              relative h-[350px] w-full rounded-lg object-cover shadow-md duration-300 group-focus-within:scale-110
              group-hover:scale-110 group-focus-visible:scale-110
            `}
          />
        ) : null}

        <Link
          to="/title/$titleId"
          params={{ titleId: title.id }}
          className="absolute inset-0 z-10"
          aria-label={t("viewDetails", { title: title.title })}
        />

        <div
          className={`
            pointer-events-none absolute inset-0 z-20 flex flex-col justify-end bg-linear-to-t from-black to-transparent
            p-4 opacity-0 duration-300 group-focus-within:opacity-100 group-hover:opacity-100
            group-focus-visible:opacity-100
          `}
        >
          <div
            className={`
              translate-y-4 transform transition-transform duration-300 group-focus-within:translate-y-0
              group-hover:translate-y-0 group-focus-visible:translate-y-0
            `}
          >
            <h4 className="text-primary-foreground mb-2 text-lg leading-tight font-bold">
              {title.title}
            </h4>
            <div className="pointer-events-auto flex gap-2">
              <Button
                type="button"
                className="z-20 h-8 w-full"
                size="sm"
                asChild
              >
                <Link to="/title/$titleId/watch" params={{ titleId: title.id }}>
                  <Play className="fill-primary-foreground" />
                  {t("watch")}
                </Link>
              </Button>
              <Button type="button" size="icon" className="z-20 h-8">
                <Plus />
                <span className="sr-only">{t("addToMyList")}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
