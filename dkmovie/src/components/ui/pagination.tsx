import type { ComponentProps } from "react";
import type { ButtonProps } from "@/components/ui/button";
import { type LinkComponentProps, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useTranslations } from "use-intl";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button-variants";

function Pagination({ className, ...props }: ComponentProps<"nav">) {
  const t = useTranslations("pagination");

  return (
    <nav
      role="navigation"
      aria-label={t("label")}
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}
function PaginationItem({ className, ...props }: ComponentProps<"li">) {
  return (
    <li
      data-slot="pagination-item"
      className={cn("cursor-pointer", className)}
      {...props}
    />
  );
}

type PaginationLinkProps = { isActive?: boolean } & Pick<ButtonProps, "size"> &
  LinkComponentProps;

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: ComponentProps<typeof PaginationLink>) {
  const t = useTranslations("pagination");

  return (
    <PaginationLink
      aria-label={t("goToPreviousPage")}
      size="default"
      className={cn("gap-1 pl-2.5", className)}
      {...props}
    >
      <ChevronLeft className="size-4" />
      <span>{t("previous")}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: ComponentProps<typeof PaginationLink>) {
  const t = useTranslations("pagination");

  return (
    <PaginationLink
      aria-label={t("goToNextPage")}
      size="default"
      className={cn("gap-1 pr-2.5", className)}
      {...props}
    >
      <span>{t("next")}</span>
      <ChevronRight className="size-4" />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: ComponentProps<"span">) {
  const t = useTranslations("pagination");

  return (
    <span
      aria-hidden
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">{t("morePages")}</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
