import Image from "next/image";
import Link from "next/link";
import { calculateDiscountPercent, calculateSavings, formatMoney } from "@/lib/pricing";
import type { Item } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

type Props = {
  item: Item;
};

export function ItemCard({ item }: Props) {
  const primaryImage = item.images.find((image) => image.is_primary) ?? item.images[0];
  const savings = calculateSavings(item.current_retail_price, item.selling_price);
  const discount = calculateDiscountPercent(item.current_retail_price, item.selling_price);

  return (
    <Link
      href={`/item/${item.slug}`}
      className="group grid overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft transition hover:-translate-y-0.5 hover:border-pine/35"
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
            Photo coming soon
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge status={item.status} />
        </div>
        {item.status === "Sold" && (
          <div className="absolute inset-0 grid place-items-center bg-ink/50 text-4xl font-black uppercase tracking-wide text-white">
            Sold
          </div>
        )}
      </div>

      <div className="grid gap-4 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-pine/75">{item.category}</p>
          <h2 className="mt-1 text-lg font-semibold leading-tight text-ink">{item.title}</h2>
        </div>

        <div className="grid gap-2">
          <div>
            <p className="text-xs font-semibold uppercase text-ink/50">My price</p>
            <p className="text-3xl font-extrabold text-pine">{formatMoney(item.selling_price, item.currency)}</p>
          </div>
          <div className="flex items-end justify-between gap-3 border-t border-ink/10 pt-3">
            <div>
              <p className="text-xs font-semibold uppercase text-ink/50">Current retail price</p>
              <p className="text-sm font-semibold text-ink/60 line-through">
                {formatMoney(item.current_retail_price, item.currency)}
              </p>
            </div>
            {savings !== null && discount !== null && (
              <p className="text-right text-sm font-semibold text-clay">
                Save {formatMoney(savings, item.currency)}
                <br />
                <span className="text-xs text-ink/55">{discount}% off</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
