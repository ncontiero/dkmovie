import type { Movie } from "@/utils/types";
import { Mousewheel, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { MovieCard } from "./movie-card";

interface CarouselProps {
  readonly title: string;
  readonly items: Movie[];
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
