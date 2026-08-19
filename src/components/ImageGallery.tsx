"use client";

import Image from "next/image";
import { useState } from "react";
import type { ItemImage } from "@/lib/types";

type Props = {
  title: string;
  images: ItemImage[];
};

export function ImageGallery({ title, images }: Props) {
  const [selectedId, setSelectedId] = useState(images[0]?.id);
  const selected = images.find((image) => image.id === selectedId) ?? images[0];

  if (!selected) {
    return (
      <div className="grid aspect-[4/3] place-items-center rounded-lg border border-dashed border-ink/20 bg-white/70 text-ink/55">
        暂无图片
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-oat/35">
        <Image
          src={selected.image_url}
          alt={selected.alt_text ?? title}
          fill
          priority
          sizes="(min-width: 1024px) 52vw, 100vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedId(image.id)}
              className="relative aspect-square overflow-hidden rounded-md border border-ink/10 bg-white outline-none ring-pine transition focus:ring-2 data-[active=true]:border-pine"
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
    </div>
  );
}
