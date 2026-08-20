"use client";

import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ItemImage } from "@/lib/types";

type Props = {
  title: string;
  images: ItemImage[];
};

const minZoom = 1;
const maxZoom = 5;
const doubleTapDelay = 280;

type Point = {
  x: number;
  y: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function ImageGallery({ title, images }: Props) {
  const [selectedId, setSelectedId] = useState(images[0]?.id);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const pointersRef = useRef(new Map<number, Point>());
  const dragRef = useRef<{ startPointer: Point; startPan: Point } | null>(null);
  const pinchRef = useRef<{ startDistance: number; startZoom: number } | null>(null);
  const lastTapRef = useRef(0);
  const selectedIndex = Math.max(
    0,
    images.findIndex((image) => image.id === selectedId)
  );
  const selected = images[selectedIndex] ?? images[0];

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    pointersRef.current.clear();
    dragRef.current = null;
    pinchRef.current = null;
  }, []);

  const showPrevious = useCallback(() => {
    if (images.length < 2) {
      return;
    }

    const nextIndex = (selectedIndex - 1 + images.length) % images.length;
    setSelectedId(images[nextIndex].id);
    resetZoom();
  }, [images, resetZoom, selectedIndex]);

  const showNext = useCallback(() => {
    if (images.length < 2) {
      return;
    }

    const nextIndex = (selectedIndex + 1) % images.length;
    setSelectedId(images[nextIndex].id);
    resetZoom();
  }, [images, resetZoom, selectedIndex]);

  const closeViewer = useCallback(() => {
    setIsViewerOpen(false);
    resetZoom();
  }, [resetZoom]);

  const updateZoom = useCallback((nextZoom: number) => {
    setZoom((currentZoom) => {
      const clampedZoom = clamp(nextZoom, minZoom, maxZoom);

      if (clampedZoom === minZoom) {
        setPan({ x: 0, y: 0 });
      }

      if (currentZoom === minZoom && clampedZoom > minZoom) {
        setPan({ x: 0, y: 0 });
      }

      return clampedZoom;
    });
  }, []);

  const stepZoom = useCallback((amount: number) => {
    setZoom((currentZoom) => {
      const nextZoom = clamp(Number((currentZoom + amount).toFixed(2)), minZoom, maxZoom);

      if (nextZoom === minZoom) {
        setPan({ x: 0, y: 0 });
      }

      return nextZoom;
    });
  }, []);

  const toggleZoom = useCallback(() => {
    if (zoom > 1) {
      resetZoom();
      return;
    }

    updateZoom(2.5);
  }, [resetZoom, updateZoom, zoom]);

  useEffect(() => {
    if (!isViewerOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeViewer();
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
  }, [closeViewer, isViewerOpen, showNext, showPrevious]);

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
        onClick={() => {
          resetZoom();
          setIsViewerOpen(true);
        }}
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
          onClick={closeViewer}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">{imagePosition}</p>
            <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                onClick={() => stepZoom(0.5)}
                className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/20"
                aria-label="放大"
              >
                <Plus className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => stepZoom(-0.5)}
                className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/20"
                aria-label="缩小"
              >
                <Minus className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/20"
                aria-label="重置缩放"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={closeViewer}
                className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink shadow-lg"
                aria-label="关闭图片"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="relative grid min-h-0 place-items-center" onClick={closeViewer}>
            <div
              className="relative h-full max-h-[82vh] w-full max-w-6xl touch-none overflow-hidden"
              onClick={(event) => event.stopPropagation()}
              onWheel={(event) => {
                event.preventDefault();
                const direction = event.deltaY > 0 ? -0.25 : 0.25;
                stepZoom(direction);
              }}
              onDoubleClick={(event) => {
                event.stopPropagation();
                toggleZoom();
              }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                const point = { x: event.clientX, y: event.clientY };
                pointersRef.current.set(event.pointerId, point);

                if (pointersRef.current.size === 1 && zoom > 1) {
                  dragRef.current = {
                    startPointer: point,
                    startPan: pan
                  };
                }

                if (pointersRef.current.size === 2) {
                  const [first, second] = Array.from(pointersRef.current.values());
                  pinchRef.current = {
                    startDistance: distance(first, second),
                    startZoom: zoom
                  };
                  dragRef.current = null;
                }
              }}
              onPointerMove={(event) => {
                if (!pointersRef.current.has(event.pointerId)) {
                  return;
                }

                pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

                if (pointersRef.current.size === 2 && pinchRef.current) {
                  const [first, second] = Array.from(pointersRef.current.values());
                  const nextZoom = pinchRef.current.startZoom * (distance(first, second) / pinchRef.current.startDistance);
                  updateZoom(nextZoom);
                  return;
                }

                if (zoom > 1 && dragRef.current) {
                  const deltaX = event.clientX - dragRef.current.startPointer.x;
                  const deltaY = event.clientY - dragRef.current.startPointer.y;
                  setPan({
                    x: dragRef.current.startPan.x + deltaX,
                    y: dragRef.current.startPan.y + deltaY
                  });
                }
              }}
              onPointerUp={(event) => {
                pointersRef.current.delete(event.pointerId);
                dragRef.current = null;
                pinchRef.current = null;

                const now = Date.now();
                if (now - lastTapRef.current < doubleTapDelay) {
                  toggleZoom();
                  lastTapRef.current = 0;
                } else {
                  lastTapRef.current = now;
                }
              }}
              onPointerCancel={(event) => {
                pointersRef.current.delete(event.pointerId);
                dragRef.current = null;
                pinchRef.current = null;
              }}
            >
              <Image
                src={selected.image_url}
                alt={selected.alt_text ?? title}
                fill
                sizes="100vw"
                className="select-none object-contain"
                priority
                draggable={false}
                style={{
                  transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: pointersRef.current.size > 0 ? "none" : "transform 120ms ease-out"
                }}
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showPrevious();
                  }}
                  className="absolute bottom-4 left-4 grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white ring-1 ring-white/25 transition hover:bg-black/75 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
                  aria-label="上一张"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showNext();
                  }}
                  className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white ring-1 ring-white/25 transition hover:bg-black/75 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
                  aria-label="下一张"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          <p className="py-2 text-center text-xs text-white/65">
            {zoom.toFixed(1)}x · 点击空白处或按 Esc 关闭
          </p>
        </div>
      )}
    </div>
  );
}
