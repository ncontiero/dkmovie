import type { ContentsType, Title } from "@/utils/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "use-intl";
import { AnimatedRoute } from "@/components/animated-route";
import { TitleCard, TitleCardSkeleton } from "@/components/title-card";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { genresListQueryOptions } from "@/utils/query-options/genres";

export function ListPendingComponent() {
  return (
    <AnimatedRoute>
      <div className="mt-24 min-h-screen">
        <main className="container mx-auto h-[70vh] max-w-7xl px-4 sm:px-6 md:h-[80vh] lg:px-8">
          <Skeleton className="h-9 w-1/4" />
          <Separator className="mt-2 mb-5" />
          <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 8 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <TitleCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    </AnimatedRoute>
  );
}

interface ListComponentProps {
  readonly title: string;
  readonly contentTypes?: ContentsType[];
  readonly searchGenre?: string;
  readonly page?: number;
  readonly pages: number;
  readonly titles?: Title[];
  readonly onGenreSelect: (genre: string) => void;
  readonly onContentTypeChange: (contentType: ContentsType) => void;
}

export function ListComponent({
  title,
  contentTypes,
  searchGenre,
  page,
  pages,
  titles,
  onGenreSelect,
  onContentTypeChange,
}: ListComponentProps) {
  const t = useTranslations("listsContainer");
  const { data: genres } = useSuspenseQuery(genresListQueryOptions);

  const contentTypeLength = contentTypes ? contentTypes.length : 0;
  const contentTypeText = contentTypeLength > 0 ? `(${contentTypeLength})` : "";
  const searchGenreText = searchGenre ? `(${searchGenre})` : "";
  const filterLength = contentTypeLength + (searchGenre ? 1 : 0);
  const filterLengthText = filterLength > 0 ? `(${filterLength})` : "";

  return (
    <AnimatedRoute>
      <main className="my-24 min-h-screen">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{title}</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={titles?.length === 0}>
                <Button type="button" variant="outline">
                  {t("filters", { count: filterLengthText })}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="p-2">
                    {t("filterGenre", { count: searchGenreText })}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-background">
                    <Command className="bg-background">
                      <CommandInput placeholder={t("searchGenre")} autoFocus />
                      <CommandList>
                        <CommandEmpty>{t("noGenres")}</CommandEmpty>
                        <CommandGroup>
                          {genres?.map((genre) => (
                            <CommandItem
                              key={genre.slug}
                              value={genre.name}
                              onSelect={onGenreSelect}
                              className="p-2"
                            >
                              {genre.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="p-2">
                    {t("contentType", { type: contentTypeText })}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-background">
                    <DropdownMenuCheckboxItem
                      className="bg-background py-2"
                      checked={contentTypes?.includes("MOVIE")}
                      onCheckedChange={() => onContentTypeChange("MOVIE")}
                    >
                      {t("movies")}
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      className="bg-background py-2"
                      checked={contentTypes?.includes("SERIES")}
                      onCheckedChange={() => onContentTypeChange("SERIES")}
                    >
                      {t("series")}
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Separator className="mt-2 mb-5" />
          <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {titles?.map((title) => (
              <TitleCard key={title.id} title={title} horizontalOnMobile />
            ))}
          </div>
          {titles && titles.length > 0 ? (
            <>
              <Separator className="my-5" />
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      to="/search"
                      search={(prev) => ({
                        ...prev,
                        page: Math.max(1, (prev.page || 1) - 1),
                      })}
                    />
                  </PaginationItem>
                  {Array.from({ length: pages }).map((_, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <PaginationItem key={i}>
                      <PaginationLink
                        to="/search"
                        search={(prev) => ({ ...prev, page: i + 1 })}
                        isActive={page === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      to="/search"
                      search={(prev) => ({
                        ...prev,
                        page: Math.min(pages, (prev.page || 1) + 1),
                      })}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          ) : null}
        </div>
      </main>
    </AnimatedRoute>
  );
}
