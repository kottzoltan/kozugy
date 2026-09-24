"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  if (!images.length) return null;

  return (
    <>
      <div className="space-y-2">
        <button
          type="button"
          className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted focus-ring"
          onClick={() => setLightbox(0)}
        >
          <Image
            src={images[0]}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 65vw"
            priority
          />
        </button>
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.slice(1).map((src, i) => (
              <button
                key={src}
                type="button"
                className="relative aspect-square overflow-hidden rounded-lg bg-muted focus-ring"
                onClick={() => setLightbox(i + 1)}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="120px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal
          aria-label="Kép nagyítása"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setLightbox(null)}
            aria-label="Bezárás"
          >
            <X className="size-5" />
          </button>
          <div
            className={cn("relative h-[80vh] w-full max-w-4xl")}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightbox]}
              alt={alt}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
