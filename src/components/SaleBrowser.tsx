"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { ItemCard } from "@/components/ItemCard";
import type { Item, ItemStatus } from "@/lib/types";

type SortMode = "featured" | "price-asc" | "price-desc" | "discount-desc";

type Props = {
  items: Item[];
  hideSoldHomepage: boolean;
};

const statuses: Array<ItemStatus | "All"> = ["All", "Available", "Reserved", "Sold"];

export function SaleBrowser({ items, hideSoldHomepage }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState<ItemStatus | "All">(hideSoldHomepage ? "Available" : "All");
  const [sort, setSort] = useState<SortMode>("featured");

  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((item) => item.category))).sort()], [items]);

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items
      .filter((item) => !hideSoldHomepage || item.status !== "Sold")
      .filter((item) => category === "All" || item.category === category)
      .filter((item) => status === "All" || item.status === status)
      .filter((item) => {
        if (!query) {
          return true;
        }

        return [item.title, item.category, item.brand, item.model, item.description]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));
      })
      .sort((a, b) => {
        if (sort === "price-asc") return a.selling_price - b.selling_price;
        if (sort === "price-desc") return b.selling_price - a.selling_price;
        if (sort === "discount-desc") {
          const discountA = (a.current_retail_price ?? 0) - a.selling_price;
          const discountB = (b.current_retail_price ?? 0) - b.selling_price;
          return discountB - discountA;
        }

        return Number(b.featured) - Number(a.featured) || a.sort_order - b.sort_order;
      });
  }, [category, hideSoldHomepage, items, search, sort, status]);

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-16 sm:px-6 lg:px-8">
      <div className="grid gap-3 rounded-lg border border-ink/10 bg-white/85 p-4 shadow-soft backdrop-blur md:grid-cols-[1fr_auto_auto_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
          <span className="sr-only">Search items</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search chairs, lamps, kitchen..."
            className="h-11 w-full rounded-md border border-ink/12 bg-white pl-10 pr-3 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15"
          />
        </label>

        <label className="relative">
          <span className="sr-only">Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-11 w-full rounded-md border border-ink/12 bg-white px-3 outline-none focus:border-pine md:w-44"
          >
            {categories.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ItemStatus | "All")}
            className="h-11 w-full rounded-md border border-ink/12 bg-white px-3 outline-none focus:border-pine md:w-40"
          >
            {statuses.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
          <span className="sr-only">Sort</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortMode)}
            className="h-11 w-full rounded-md border border-ink/12 bg-white pl-10 pr-3 outline-none focus:border-pine md:w-48"
          >
            <option value="featured">Featured first</option>
            <option value="price-asc">Price low to high</option>
            <option value="price-desc">Price high to low</option>
            <option value="discount-desc">Biggest savings</option>
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink/65">{visibleItems.length} item{visibleItems.length === 1 ? "" : "s"} listed</p>
        <p className="text-sm font-medium text-pine">Pickup in Copenhagen</p>
      </div>

      {visibleItems.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-ink/20 bg-white/60 p-10 text-center text-ink/60">
          No items match those filters.
        </div>
      )}
    </section>
  );
}
