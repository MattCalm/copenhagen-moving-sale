"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ItemImage } from "@/lib/types";

type Props = {
  title: string;
  images: ItemImage[];
};

export function ImageGallery({ title, images }: Props) {
  const [selectedId, setSelectedId] = useState(images[0]?.id);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const selectedIndex = Math.max(
    0,
    images.findIndex((image) => image.id === selectedId)
  );
  const selected = images[selectedIndex] ?? images[0];

  const showPrevious = useCallback(() => {
    if (images.length < 2) {
      return;
    }

    const nextIndex = (selectedIndex - 1 + images.length) % images.length;
    setSelectedId(images[nextIndex].id);
  }, [images, selectedIndex]);

  const showNext = useCallback(() => {
    if (images.length < 2) {
      return;
    }

    const nextIndex = (selectedIndex + 1) % images.length;
    setSelectedId(images[nextIndex].id);
  }, [images, selectedIndex]);

  useEffect(() => {
    if (!isViewerOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsViewerOpen(false);
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isViewerOpen, showNext, showPrevious]);

  const imagePosition = useMemo(() => `${selectedIndex + 1} / ${images.length}`, [images.length, selectedIndex]);

  if (!selected) {
    return (
      <div className="grid min-h-[280px] place-items-center rounded-lg border border-dashed border-ink/20 bg-white/70 text-ink/55">
        暂无图片
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <button
        type="button"
        onClick={() => setIsViewerOpen(true)}
        className="relative h-[min(70vh,680px)] min-h-[280px] overflow-hidden rounded-lg bg-[#f1eee7] outline-none ring-pine transition focus:ring-2 md:h-[min(75vh,760px)]"
        aria-label="打开大图"
      >
        <Image
          src={selected.image_url}
          alt={selected.alt_text ?? title}
          fill
          priority
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-contain p-2"
        />
      </button>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedId(image.id)}
              className="relative aspect-square overflow-hidden rounded-md border-2 border-transparent bg-white outline-none ring-pine transition focus:ring-2 data-[active=true]:border-pine data-[active=true]:shadow-sm"
              data-active={image.id === selected.id}
            >
              <Image
                src={image.image_url}
                alt={image.alt_text ?? title}
                fill
                sizes="88px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {isViewerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="图片查看器"
          className="fixed inset-0 z-50 grid grid-rows-[auto_1fr_auto] bg-black/92 p-3 text-white sm:p-5"
          onClick={() => setIsViewerOpen(false)}
          onTouchStart={(event) => setTouchStartX(event.changedTouches[0].clientX)}
          onTouchEnd={(event) => {
            if (touchStartX === null) {
              return;
            }

            const deltaX = event.changedTouches[0].clientX - touchStartX;
            setTouchStartX(null);

            if (Math.abs(deltaX) < 45) {
              return;
            }

            if (deltaX > 0) {
              showPrevious();
            } else {
              showNext();
            }
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">{imagePosition}</p>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsViewerOpen(false);
              }}
              className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink shadow-lg"
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative min-h-0" onClick={(event) => event.stopPropagation()}>
            <Image
              src={selected.image_url}
              alt={selected.alt_text ?? title}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevious}
                  className="absolute bottom-4 left-4 grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white ring-1 ring-white/25 transition hover:bg-black/75 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
                  aria-label="上一张"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white ring-1 ring-white/25 transition hover:bg-black/75 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
                  aria-label="下一张"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          <p className="py-2 text-center text-xs text-white/65">点击空白处或按 Esc 关闭</p>
        </div>
      )}
    </div>
  );
}
