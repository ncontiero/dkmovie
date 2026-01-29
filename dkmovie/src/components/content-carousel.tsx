import type { RootRouteChildren } from "@/routeTree.gen";
import type { Title } from "@/utils/types";
import { ChevronRight } from "lucide-react";
import { Mousewheel, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useTranslations } from "use-intl";
import { TitleCard, TitleCardSkeleton } from "./title-card";
import { Link } from "./ui/link";
import { Skeleton } from "./ui/skeleton";

export interface CarouselProps {
  readonly title: string;
  readonly items: Title[];
  readonly searchParams?: RootRouteChildren["ListsSearchRoute"]["types"]["fullSearchSchema"];
}

export function ContentCarousel({ title, items, searchParams }: CarouselProps) {
  const t = useTranslations("common");

  if (!items || items.length === 0) return null;

  return (
    <section className="py-4">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-2 flex items-center gap-4">
          <h3 className="text-foreground text-2xl font-semibold">{title}</h3>
          {searchParams ? (
            <Link
              to="/search"
              search={searchParams}
              variant="muted"
              className="mt-1 hover:scale-105 focus-visible:scale-105 hover:[&_svg]:translate-x-1"
            >
              {t("seeMore")}
              <ChevronRight className="duration-200" />
            </Link>
          ) : null}
        </div>
        <Swiper
          modules={[Navigation, Pagination, Mousewheel]}
          spaceBetween={16}
          slidesPerView="auto"
          navigation
          pagination={{
            clickable: true,
          }}
          mousewheel
          className="-mx-2.5! px-2.5! pt-4! pb-10!"
        >
          {items.map((item) => (
            <SwiperSlide key={item.id} className="w-40! sm:w-48! lg:w-56!">
              <TitleCard title={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export function CarouselSkeleton() {
  return (
    <section className="mt-4 py-4">
      <div className="container mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-1/3" />
        <div className="flex gap-5 overflow-hidden">
          {[...Array.from({ length: 5 })].map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <TitleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
