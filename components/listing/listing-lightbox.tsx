"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { ListingMediaItem } from "./types";

interface ListingLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: ListingMediaItem[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  title: string;
}

export function ListingLightbox({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNavigate,
  title,
}: ListingLightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate((currentIndex - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") onNavigate((currentIndex + 1) % images.length);
    },
    [isOpen, onClose, onNavigate, currentIndex, images.length]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || images.length === 0) return null;

  const currentImg = images[currentIndex] ?? images[0];
  if (!currentImg) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery lightbox"
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md select-none animate-in fade-in-0 duration-200"
    >
      {/* Top Bar */}
      <div className="flex h-16 items-center justify-between px-6 text-white border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm truncate max-w-xs md:max-w-md text-white/90">
            {title}
          </span>
          <span className="text-xs bg-white/15 px-2.5 py-0.5 rounded-full font-mono text-white/80">
            {currentIndex + 1} of {images.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo gallery"
          className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 flex items-center justify-center p-4 min-h-0">
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onNavigate((currentIndex - 1 + images.length) % images.length)}
            aria-label="Previous photo"
            className="absolute left-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white border border-white/10 transition cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <div className="relative w-full h-full max-w-5xl flex items-center justify-center">
          <Image
            src={currentImg.url}
            alt={currentImg.altText || `${title} photo ${currentIndex + 1}`}
            fill
            sizes="100vw"
            priority
            className="object-contain transition-all duration-300"
          />
        </div>

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onNavigate((currentIndex + 1) % images.length)}
            aria-label="Next photo"
            className="absolute right-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white border border-white/10 transition cursor-pointer"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Caption & Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="p-4 border-t border-white/10 bg-black/40 shrink-0">
          <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-4xl mx-auto py-1 scrollbar-thin">
            {images.map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => onNavigate(idx)}
                aria-label={`View photo ${idx + 1}`}
                className={`relative h-14 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                  idx === currentIndex
                    ? "border-primary scale-105 opacity-100 ring-2 ring-primary/40"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
