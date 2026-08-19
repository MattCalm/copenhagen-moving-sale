import Image from "next/image";
import Link from "next/link";
import { formatPublicPrice } from "@/lib/pricing";
import type { Item } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

type Props = {
  item: Item;
};

export function ItemCard({ item }: Props) {
  const primaryImage = item.images.find((image) => image.is_primary) ?? item.images[0];

  return (
    <Link
      href={`/item/${item.slug}`}
      className="group grid overflow-hidden rounded-lg border border-ink/10 bg-white transition hover:border-pine/35"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-oat/35">
        {primaryImage ? (
          <Image
            src={primaryImage.image_url}
            alt={primaryImage.alt_text ?? item.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-ink/55">
            暂无图片
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge status={item.status} />
        </div>
        {item.status === "Sold" && (
          <div className="absolute inset-0 grid place-items-center bg-ink/50 text-3xl font-black text-white">
            已售出
          </div>
        )}
      </div>

      <div className="grid gap-3 p-4">
        <h2 className="text-lg font-bold leading-tight text-ink">{item.title}</h2>

        <div className="grid gap-2">
          <div>
            <p className="text-sm font-semibold text-ink/55">二手价</p>
            <p className="text-3xl font-black text-pine">{formatPublicPrice(item.selling_price, item.currency)}</p>
          </div>
          {item.current_retail_price !== null && item.current_retail_price !== undefined && (
            <p className="text-sm font-medium text-ink/60">
              新品参考价 <span className="line-through">{formatPublicPrice(item.current_retail_price, item.currency)}</span>
            </p>
          )}
        </div>

        <span className="text-sm font-semibold text-pine">查看详情</span>
      </div>
    </Link>
  );
}
