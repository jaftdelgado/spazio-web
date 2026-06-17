"use client";

import { Building03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Carousel_005 } from "@/components/ui/skiper-ui/skiper51";
import type { PropertyPhoto } from "@properties/domain/property.entity";

type PropertyPhotoCarouselProps = {
  emptyLabel: string;
  photos: PropertyPhoto[];
  title: string;
};

export function PropertyPhotoCarousel({
  emptyLabel,
  photos,
  title,
}: PropertyPhotoCarouselProps) {
  const images = photos
    .filter((photo) => photo.url)
    .map((photo) => ({
      src: photo.url as string,
      alt: photo.altText || photo.label || title,
    }));

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[28px] bg-muted/35 text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <HugeiconsIcon icon={Building03Icon} size={40} strokeWidth={1.8} />
          <p className="text-sm font-medium">{emptyLabel}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="property-show-carousel overflow-hidden rounded-[28px] bg-muted/20">
      <style>{`
        .property-show-carousel .Carousal_005 {
          height: clamp(320px, 52vw, 560px);
          padding-bottom: 42px !important;
        }

        .property-show-carousel .swiper-slide {
          border-radius: 28px;
        }

        .property-show-carousel .swiper-button-next,
        .property-show-carousel .swiper-button-prev {
          display: flex;
          height: 40px;
          width: 40px;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          background: color-mix(in oklab, var(--background) 82%, transparent);
          backdrop-filter: blur(10px);
        }

        .property-show-carousel .swiper-pagination-bullet {
          opacity: 0.35;
        }

        .property-show-carousel .swiper-pagination-bullet-active {
          opacity: 1;
        }
      `}</style>
      <Carousel_005
        className="max-w-none px-0"
        images={images}
        loop={images.length > 1}
        showNavigation={images.length > 1}
        showPagination={images.length > 1}
        spaceBetween={16}
      />
    </div>
  );
}
