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
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        status === "Available" && "border-pine/20 bg-pine text-white",
        status === "Reserved" && "border-clay/30 bg-clay/10 text-clay",
        status === "Sold" && "border-ink/15 bg-ink text-white",
        strong && "text-sm"
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
