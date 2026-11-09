"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Sparkles, Images } from "lucide-react";
import { ListingMediaItem } from "./types";
import { ListingLightbox } from "./listing-lightbox";

interface ListingHeroBentoProps {
  media: ListingMediaItem[];
  title: string;
  startingPrice?: string | null;
  categoryName?: string | null;
}

export function ListingHeroBento({
  media,
  title,
  startingPrice,
  categoryName,
}: ListingHeroBentoProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // If no media, display a rich placeholder banner with directory brand styling
  if (!media || media.length === 0) {
    return (
      <div className="relative w-full h-[280px] sm:h-[360px] md:h-[420px] rounded-3xl overflow-hidden border border-border/80 bg-gradient-to-br from-muted/80 via-card to-muted/40 flex flex-col items-center justify-center p-6 text-center shadow-xs">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
          <Camera className="h-8 w-8" />
        </div>
        <h3 className="font-bold text-lg text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Storefront and business interior photos will appear here once uploaded by the business owner.
        </p>
        {categoryName && (
          <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            {categoryName}
          </span>
        )}
      </div>
    );
  }

  const primaryImage = media[0];
  if (!primaryImage) return null;
  const sideImages = media.slice(1, 5);
  const remainingCount = Math.max(0, media.length - 5);

  return (
    <>
      <div className="relative group/bento w-full">
        {/* Desktop / Tablet Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2.5 h-[320px] sm:h-[400px] md:h-[460px] rounded-3xl overflow-hidden border border-border/70 shadow-sm bg-muted/20">
          {/* Main Hero Tile (Col 1-2, Row 1-2 on desktop) */}
          <div
            onClick={() => openLightbox(0)}
            className={`relative md:col-span-2 md:row-span-2 overflow-hidden cursor-pointer group ${
              media.length === 1 ? "col-span-full row-span-full h-full" : "h-[220px] md:h-full"
            }`}
          >
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || `${title} primary storefront`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none opacity-80 group-hover:opacity-60 transition-opacity" />

            {/* Starting Price Pill */}
            {startingPrice && (
              <div className="absolute bottom-4 left-4 z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white shadow-lg">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold tracking-wide">
                    {startingPrice}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Sub Tiles (Col 3-4, Stacked Rows) */}
          {sideImages.map((item, index) => {
            const actualIndex = index + 1;
            const isLastVisibleSlot = index === 3 || actualIndex === media.length - 1;
            const showMoreOverlay = index === 3 && remainingCount > 0;

            return (
              <div
                key={item.id || actualIndex}
                onClick={() => openLightbox(actualIndex)}
                className="relative hidden md:block overflow-hidden cursor-pointer group h-full"
              >
                <Image
                  src={item.url}
                  alt={item.altText || `${title} photo ${actualIndex + 1}`}
                  fill
                  sizes="25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

                {/* +N More Photos Overlay */}
                {showMoreOverlay && (
                  <div className="absolute inset-0 bg-black/65 backdrop-blur-xs flex flex-col items-center justify-center text-white transition hover:bg-black/75">
                    <Images className="h-6 w-6 mb-1 text-white/90" />
                    <span className="font-extrabold text-sm tracking-wide">
                      +{remainingCount} Photos
                    </span>
                    <span className="text-[11px] text-white/80 font-medium">View Gallery</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* View All Photos Button (Floating Bottom Right) */}
        {media.length > 0 && (
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-xl bg-background/90 hover:bg-background text-foreground text-xs font-bold border border-border shadow-md backdrop-blur-md transition-all hover:scale-102 cursor-pointer active:scale-98"
          >
            <Images className="h-4 w-4 text-primary" />
            <span>Show all {media.length} photos</span>
          </button>
        )}
      </div>

      {/* Lightbox Modal */}
      <ListingLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={media}
        currentIndex={lightboxIndex}
        onNavigate={setLightboxIndex}
        title={title}
      />
    </>
  );
}
