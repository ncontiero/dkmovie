import type { Title } from "@/utils/types";
import { Link } from "@tanstack/react-router";
import { useTranslations } from "use-intl";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { MyListButton } from "./my-list-button";
import { Skeleton } from "./ui/skeleton";
import { WatchButton } from "./watch-button";

interface TitleCardProps {
  readonly title: Title;
  readonly horizontalOnMobile?: boolean;
}

export function TitleCard({
  title,
  horizontalOnMobile = false,
}: TitleCardProps) {
  const t = useTranslations("titlePage");
  const { isMobile } = useIsMobile({ mobileMaxWidth: 640 });

  const image = title.cover || title.poster;
  const img = image
    ? horizontalOnMobile && isMobile
      ? title.cover
      : title.poster
    : undefined;

  return (
    <div
      className={`
        group relative shrink-0 transform rounded-lg focus-visible:outline-hidden
        ${horizontalOnMobile ? "max-sm:flex max-sm:flex-row max-sm:items-center" : ""}
      `}
    >
      <div
        className={`
          overflow-hidden rounded-lg ring-ring ring-offset-2 ring-offset-background duration-300 group-hover:scale-105
          not-focus-within:group-hover:-translate-y-2 group-focus-visible:scale-105 group-focus-visible:ring-2
          focus-within:scale-105 focus-within:ring-2
          ${
            horizontalOnMobile
              ? `max-sm:size-auto max-sm:w-full max-sm:group-hover:scale-100 max-sm:group-focus-visible:scale-100`
              : ""
          }
        `}
      >
        <div
          className={`
            relative h-62.5 w-full rounded-lg shadow-md sm:h-[350px]
            ${horizontalOnMobile ? "max-sm:h-36 max-sm:w-full max-sm:shrink-0" : ""}
          `}
        >
          {title.poster ? (
            <img
              src={img || ""}
              alt={title.title}
              className={`
                size-full object-cover shadow-md duration-300 group-focus-within:scale-110 group-hover:scale-110
                group-focus-visible:scale-110
                ${
                  horizontalOnMobile
                    ? `max-sm:group-focus-within:scale-100 max-sm:group-hover:scale-100 max-sm:group-focus-visible:scale-100`
                    : ""
                }
              `}
            />
          ) : (
            <div
              className={`
                flex size-full items-center justify-center bg-linear-to-bl from-black to-primary/40 text-center
                ${horizontalOnMobile ? "max-sm:h-36 max-sm:w-24 max-sm:shrink-0" : ""}
              `}
            >
              <p className="text-lg font-bold">{title.title}</p>
            </div>
          )}
        </div>

        <Link
          to="/title/$titleId"
          params={{ titleId: title.id }}
          className="absolute inset-0 z-10"
          aria-label={t("viewDetails", { title: title.title })}
        />

        <div
          className={`
            pointer-events-none absolute inset-0 z-20 flex flex-col justify-end bg-linear-to-t from-black to-transparent px-2
            py-4 opacity-0 duration-300 group-focus-within:opacity-100 group-hover:opacity-100
            group-focus-visible:opacity-100
            ${
              horizontalOnMobile
                ? `
                  max-sm:pointer-events-auto max-sm:relative max-sm:inset-auto max-sm:z-auto max-sm:flex-row
                  max-sm:justify-start max-sm:bg-linear-to-b max-sm:from-40% max-sm:to-primary max-sm:p-2 max-sm:opacity-100
                  dark:max-sm:to-primary/50
                `
                : ""
            }
          `}
        >
          <div
            className={`
              translate-y-4 transform transition-transform duration-300 group-focus-within:translate-y-0
              group-hover:translate-y-0 group-focus-visible:translate-y-0
              ${horizontalOnMobile ? "max-sm:translate-y-0" : ""}
            `}
          >
            <h4 className="mb-2 text-lg/tight font-bold text-primary-foreground">
              {title.title}
            </h4>
            <div className="pointer-events-auto flex gap-1">
              <WatchButton title={title} variant="small" />
              <MyListButton
                titleId={title.id}
                size="icon"
                className="z-20 h-8"
                isTextHidden
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TitleCardSkeleton() {
  return (
    <div className="w-40 shrink-0 space-y-3 sm:w-48 lg:w-56">
      <Skeleton className="h-62.5 w-full rounded-lg sm:h-[350px]" />
    </div>
  );
}
