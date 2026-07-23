import type { Title } from "@/utils/types";
import { Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useTranslations } from "use-intl";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { WatchButton } from "./watch-button";

interface HeroProps {
  readonly content: Title[];
}

function HeroSectionItem({ content }: { readonly content: Title }) {
  const t = useTranslations("heroSection");

  return (
    <div className="relative h-[75vh] w-full overflow-hidden md:h-[85vh]">
      <div className="absolute inset-0 size-full">
        {content.cover ? (
          <div className="size-full animate-in duration-1000 fade-in">
            <img
              src={content.cover}
              alt={content.title}
              className="size-full object-cover object-top md:object-center"
            />
          </div>
        ) : (
          <div className="size-full bg-linear-to-bl from-primary/20 to-black" />
        )}
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent md:hidden" />

      <div
        className={`
          hidden md:absolute md:inset-0 md:block md:bg-linear-to-r md:from-background md:via-background/50 md:to-transparent
        `}
      />

      <div className="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end pb-16 sm:pb-24 lg:pb-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl animate-in duration-1000 fill-mode-both fade-in slide-in-from-bottom-8">
            <h2
              className={`
                text-3xl font-black tracking-tight text-balance text-foreground drop-shadow-2xl sm:text-4xl lg:text-5xl
              `}
            >
              {content.title}
            </h2>
            <p
              className={`mt-6 line-clamp-3 max-w-2xl text-lg/relaxed text-foreground/80 drop-shadow-md md:line-clamp-4`}
            >
              {content.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <WatchButton title={content} />

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-12 w-full px-6 backdrop-blur-md hover:scale-105 xs:w-auto"
                asChild
              >
                <Link to="/title/$titleId" params={{ titleId: content.id }}>
                  <Info />
                  {t("moreInformation")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection({ content }: HeroProps) {
  const { isMobile } = useIsMobile();

  return (
    <Swiper
      modules={[EffectFade, Autoplay, Navigation, Pagination]}
      effect="fade"
      navigation={!isMobile}
      pagination={{
        clickable: true,
      }}
      autoplay={{ disableOnInteraction: false, delay: 5000 }}
      simulateTouch={isMobile}
      loop={content.length > 1}
    >
      {content.map((item) => (
        <SwiperSlide key={item.id}>
          <HeroSectionItem content={item} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export function HeroSectionSkeleton() {
  return (
    <Skeleton className="relative h-[75vh] w-full bg-secondary">
      <div className="relative z-10 flex h-full flex-col justify-end pb-16 sm:pb-24 lg:pb-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl space-y-4">
            <Skeleton className="h-10 w-3/4 bg-background sm:h-12 lg:h-14" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-background" />
              <Skeleton className="h-4 w-full bg-background" />
              <Skeleton className="h-4 w-3/4 bg-background" />
            </div>
            <div className="mt-8 flex flex-col gap-4 xs:flex-row">
              <Skeleton className="h-12 w-40 bg-primary" />
              <Skeleton className="h-12 w-44 bg-background" />
            </div>
          </div>
        </div>
      </div>
    </Skeleton>
  );
}
