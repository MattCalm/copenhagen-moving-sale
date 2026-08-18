import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Mail } from "lucide-react";
import { notFound } from "next/navigation";
import { ImageGallery } from "@/components/ImageGallery";
import { ShareButton } from "@/components/ShareButton";
import { StatusBadge } from "@/components/StatusBadge";
import { getItemBySlug } from "@/lib/items";
import { calculateDiscountPercent, calculateSavings, formatDate, formatMoney } from "@/lib/pricing";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getItemBySlug(slug);

  if (!item) {
    return {
      title: "Item not found"
    };
  }

  const image = item.images.find((entry) => entry.is_primary) ?? item.images[0];
  const title = `${item.title} - ${formatMoney(item.selling_price, item.currency)}`;
  const description = `${item.status} for pickup in Copenhagen. My price: ${formatMoney(item.selling_price, item.currency)}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: image ? [{ url: image.image_url, alt: image.alt_text ?? item.title }] : undefined
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image.image_url] : undefined
    }
  };
}

export default async function ItemPage({ params }: Props) {
  const { slug } = await params;
  const item = await getItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const savings = calculateSavings(item.current_retail_price, item.selling_price);
  const discount = calculateDiscountPercent(item.current_retail_price, item.selling_price);
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
  const contactHref = contactEmail
    ? `mailto:${contactEmail}?subject=${encodeURIComponent(`Copenhagen moving sale: ${item.title}`)}`
    : `mailto:?subject=${encodeURIComponent(`Copenhagen moving sale: ${item.title}`)}`;

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink/65 transition hover:text-pine">
        <ArrowLeft className="h-4 w-4" />
        Back to all items
      </Link>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:items-start">
        <ImageGallery title={item.title} images={item.images} />

        <div className="grid gap-6">
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={item.status} strong />
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink/60">
                {item.category}
              </span>
            </div>
            <h1 className="text-4xl font-black leading-tight text-ink sm:text-5xl">{item.title}</h1>
            <p className="text-base text-ink/65">
              {[item.brand, item.model].filter(Boolean).join(" - ") || "Personal Copenhagen moving-sale item"}
            </p>
          </div>

          <div className="grid gap-4 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <div>
              <p className="text-xs font-semibold uppercase text-ink/50">My price</p>
              <p className="mt-1 text-5xl font-black leading-none text-pine">
                {formatMoney(item.selling_price, item.currency)}
              </p>
            </div>
            <div className="grid gap-2 border-t border-ink/10 pt-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase text-ink/50">Current retail price</p>
                <p className="mt-1 text-lg font-bold text-ink/55 line-through">
                  {formatMoney(item.current_retail_price, item.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-ink/50">Saving</p>
                <p className="mt-1 text-lg font-bold text-clay">{formatMoney(savings, item.currency)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-ink/50">Discount</p>
                <p className="mt-1 text-lg font-bold text-clay">{discount === null ? "Not listed" : `${discount}%`}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={contactHref}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-pine px-4 text-sm font-semibold text-white transition hover:bg-ink"
            >
              <Mail className="h-4 w-4" />
              Contact about this item
            </a>
            <ShareButton title={item.title} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 pb-12 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          <h2 className="text-2xl font-bold text-ink">Details</h2>
          <p className="whitespace-pre-line text-base leading-8 text-ink/72">
            {item.description || "More details coming soon."}
          </p>
        </div>

        <dl className="grid gap-3 rounded-lg border border-ink/10 bg-white p-5 text-sm shadow-soft">
          {[
            ["Brand", item.brand],
            ["Model", item.model],
            ["Category", item.category],
            ["Condition", item.condition],
            ["Status", item.status],
            ["Pickup", "Copenhagen"],
            ["Retail price checked", formatDate(item.retail_price_checked_at)]
          ].map(([label, value]) => (
            <div key={label} className="grid grid-cols-[140px_1fr] gap-3 border-b border-ink/10 pb-3 last:border-0 last:pb-0">
              <dt className="font-semibold text-ink/55">{label}</dt>
              <dd className="font-medium text-ink">{value || "Not listed"}</dd>
            </div>
          ))}
          {item.reference_url && (
            <div className="pt-1">
              <a
                href={item.reference_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-semibold text-pine hover:text-ink"
              >
                View retail reference
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </dl>
      </section>
    </main>
  );
}
