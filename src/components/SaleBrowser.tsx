"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ItemCard } from "@/components/ItemCard";
import { getCategoryLabel } from "@/lib/public-labels";
import type { Item } from "@/lib/types";

type Props = {
  items: Item[];
};

const preferredCategories = ["Furniture", "Electronics", "Appliances", "Kitchen", "Other"];
const statusOrder = {
  Available: 0,
  Reserved: 1,
  Sold: 2
};

export function SaleBrowser({ items }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => {
    const itemCategories = Array.from(new Set(items.map((item) => item.category))).filter(Boolean);
    const ordered = preferredCategories.filter((entry) => itemCategories.includes(entry));
    const remaining = itemCategories
      .filter((entry) => !preferredCategories.includes(entry))
      .sort((a, b) => a.localeCompare(b));

    return ["All", ...ordered, ...remaining];
  }, [items]);

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items
      .filter((item) => category === "All" || item.category === category)
      .filter((item) => {
        if (!query) {
          return true;
        }

        return [item.title, item.category, item.brand, item.model, item.description]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));
      })
      .sort(
        (a, b) =>
          statusOrder[a.status] - statusOrder[b.status] ||
          Number(b.featured) - Number(a.featured) ||
          a.sort_order - b.sort_order
      );
  }, [category, items, search]);

  return (
    <section className="mx-auto grid w-full max-w-4xl gap-5 px-4 pb-14 sm:px-6">
      <div className="grid gap-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
          <span className="sr-only">搜索商品</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索商品"
            className="h-12 w-full rounded-md border border-ink/12 bg-white pl-10 pr-3 text-base outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15"
          />
        </label>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCategory(option)}
              className="h-11 shrink-0 rounded-full border border-ink/12 bg-white px-4 text-sm font-semibold text-ink transition data-[active=true]:border-pine data-[active=true]:bg-pine data-[active=true]:text-white"
              data-active={category === option}
            >
              {getCategoryLabel(option)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <p className="text-ink/60">共 {visibleItems.length} 件</p>
        <p className="font-semibold text-pine">仅 Bodenhoffs Plads 自取</p>
      </div>

      {visibleItems.length > 0 ? (
        <div className="grid gap-4 min-[520px]:grid-cols-2">
          {visibleItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-ink/20 bg-white/60 p-8 text-center text-ink/60">
          没有找到符合条件的商品。
        </div>
      )}
    </section>
  );
}
