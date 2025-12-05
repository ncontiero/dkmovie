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
    <div className="relative h-[75vh] w-full">
      <div className="absolute inset-0 size-full transition-opacity duration-700 ease-in-out">
        {content.cover ? (
          <img
            src={content.cover}
            alt={content.title}
            className="size-full object-cover object-center"
          />
        ) : null}

        <div
          className={`
            from-background via-background/60 absolute inset-0 w-full bg-linear-to-t to-transparent sm:bg-linear-to-r
            md:w-[50%]
          `}
        />
        <div
          className={`from-background via-background/40 absolute inset-0 bg-linear-to-t to-transparent backdrop-blur-xs`}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-end pb-16 sm:pb-24 lg:pb-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <h2 className="text-foreground text-4xl font-extrabold drop-shadow-lg sm:text-5xl lg:text-6xl">
              {content.title}
            </h2>
            <p className="text-foreground/80 mt-4 max-w-prose text-lg drop-shadow-md">
              {content.description}
            </p>
            <div className="xs:flex-row mt-8 flex flex-col gap-4">
              <Button
                type="button"
                size="lg"
                className="shadow-xl hover:scale-105 focus-visible:scale-105 [&_svg]:size-5"
                asChild
              >
                <Link
                  to="/title/$titleId/watch"
                  params={{ titleId: content.id }}
                >
                  <Play className="fill-current" />
                  {t("watchNow")}
                </Link>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="shadow-xl backdrop-blur-sm hover:scale-105 focus-visible:scale-105 [&_svg]:size-5"
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
      autoplay={{ disableOnInteraction: false }}
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
