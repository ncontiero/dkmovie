import type { Title } from "@/utils/types";
import { Mousewheel, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { MovieCard } from "./movie-card";
import { Skeleton } from "./ui/skeleton";

interface CarouselProps {
  readonly title: string;
  readonly items: Title[];
}

export function ContentCarousel({ title, items }: CarouselProps) {
  return (
    <section className="py-4">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h3 className="text-foreground mb-2 text-2xl font-semibold">{title}</h3>
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
              <MovieCard movie={item} />
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
        {/* Title Skeleton */}
        <Skeleton className="h-10 w-1/3" />
        {/* Card Skeletons */}
        <div className="flex gap-5 overflow-hidden">
          {[...Array.from({ length: 5 })].map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={i} className="w-40 shrink-0 space-y-3 sm:w-48 lg:w-56">
              <Skeleton className="aspect-2/3 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
