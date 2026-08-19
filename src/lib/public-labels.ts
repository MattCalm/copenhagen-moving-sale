import type { ItemStatus } from "./types";

export const categoryLabels: Record<string, string> = {
  All: "全部",
  Furniture: "家具",
  Electronics: "电器",
  Appliances: "电器",
  Kitchen: "厨房",
  Other: "其他"
};

export const statusLabels: Record<ItemStatus, string> = {
  Available: "可购买",
  Reserved: "已预订",
  Sold: "已售出"
};

export function getCategoryLabel(category: string) {
  return categoryLabels[category] ?? category;
}
