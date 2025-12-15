import type { Title } from "@/utils/types";
import { Link } from "@tanstack/react-router";
import { Info, Play } from "lucide-react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useTranslations } from "use-intl";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

interface HeroProps {
  readonly content: Title[];
}

function HeroSectionItem({ content }: { readonly content: Title }) {
  const t = useTranslations("heroSection");

  return (
    <div className="relative h-[75vh] w-full overflow-hidden md:h-[85vh]">
      <div className="absolute inset-0 size-full">
        {content.cover ? (
          <div className="animate-in fade-in size-full duration-1000">
            <img
              src={content.cover}
              alt={content.title}
              className="size-full object-cover object-top md:object-center"
            />
          </div>
        ) : (
          <div className="from-primary/20 size-full bg-linear-to-bl to-black" />
        )}
      </div>

      <div className="from-background via-background/60 absolute inset-0 bg-linear-to-t to-transparent md:hidden" />

      <div
        className={`
          md:from-background md:via-background/50 md:absolute md:inset-0 md:block md:bg-linear-to-r md:to-transparent
          hidden
        `}
      />

      <div className="via-background/30 from-background absolute inset-0 bg-linear-to-t to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end pb-16 sm:pb-24 lg:pb-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-in fade-in slide-in-from-bottom-8 fill-mode-both max-w-xl duration-1000">
            <h2
              className={`
                text-foreground text-3xl font-black tracking-tight text-balance drop-shadow-2xl sm:text-4xl lg:text-5xl
              `}
            >
              {content.title}
            </h2>
            <p
              className={`
                text-foreground/80 mt-6 line-clamp-3 max-w-2xl text-lg leading-relaxed drop-shadow-md md:line-clamp-4
              `}
            >
              {content.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className={`
                  shadow-primary/20 xs:w-auto h-12 w-full px-8 text-base font-semibold shadow-xl hover:shadow-primary/40
                  hover:scale-105
                `}
              >
                <Link
                  to="/title/$titleId/watch"
                  params={{ titleId: content.id }}
                >
                  <Play className="size-5 fill-current" />
                  {t("watchNow")}
                </Link>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="xs:w-auto h-12 w-full px-6 backdrop-blur-md hover:scale-105"
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
      loop
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
    <Skeleton className="bg-secondary relative h-[75vh] w-full">
      <div className="relative z-10 flex h-full flex-col justify-end pb-16 sm:pb-24 lg:pb-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl space-y-4">
            <Skeleton className="bg-background h-10 w-3/4 sm:h-12 lg:h-14" />
            <div className="space-y-2">
              <Skeleton className="bg-background h-4 w-full" />
              <Skeleton className="bg-background h-4 w-full" />
              <Skeleton className="bg-background h-4 w-3/4" />
            </div>
            <div className="xs:flex-row mt-8 flex flex-col gap-4">
              <Skeleton className="bg-primary h-12 w-40" />
              <Skeleton className="bg-background h-12 w-44" />
            </div>
          </div>
        </div>
      </div>
    </Skeleton>
  );
}
