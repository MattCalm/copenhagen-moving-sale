import clsx from "clsx";
import { statusLabels } from "@/lib/public-labels";
import type { ItemStatus } from "@/lib/types";

type Props = {
  status: ItemStatus;
  strong?: boolean;
};

export function StatusBadge({ status, strong = false }: Props) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ring-1 ring-black/10",
        status === "Available" && "bg-[#166534] text-white",
        status === "Reserved" && "bg-[#f59e0b] text-[#2b1700]",
        status === "Sold" && "bg-[#4b5563] text-white",
        strong && "px-3.5 py-2 text-sm"
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
