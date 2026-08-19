import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Mail, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { ImageGallery } from "@/components/ImageGallery";
import { ShareButton } from "@/components/ShareButton";
import { StatusBadge } from "@/components/StatusBadge";
import { getItemBySlug } from "@/lib/items";
import { getCategoryLabel } from "@/lib/public-labels";
import { formatPublicPrice } from "@/lib/pricing";

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
      title: "商品不存在"
    };
  }

  const image = item.images.find((entry) => entry.is_primary) ?? item.images[0];
  const title = `${item.title} - ${formatPublicPrice(item.selling_price, item.currency)}`;
  const description = `哥本哈根搬家二手清仓，仅 Bodenhoffs Plads 自取。二手价：${formatPublicPrice(item.selling_price, item.currency)}。`;

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

  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
  const contactHref = contactEmail
    ? `mailto:${contactEmail}?subject=${encodeURIComponent(`想购买：${item.title}`)}`
    : `mailto:?subject=${encodeURIComponent(`想购买：${item.title}`)}`;

  return (
    <main className="mx-auto grid max-w-4xl gap-6 px-4 py-5 sm:px-6">
      <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink/65 transition hover:text-pine">
        <ArrowLeft className="h-4 w-4" />
        返回全部商品
      </Link>

      <section className="grid gap-5">
        <div className="grid gap-3">
          <h1 className="text-3xl font-black leading-tight text-ink sm:text-5xl">{item.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={item.status} strong />
            {item.category && (
              <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-ink/60">
                {getCategoryLabel(item.category)}
              </span>
            )}
          </div>
        </div>

        <ImageGallery title={item.title} images={item.images} />

        <div className="grid gap-4 rounded-lg border border-ink/10 bg-white p-4">
          <div>
            <p className="text-sm font-semibold text-ink/55">二手价</p>
            <p className="mt-1 text-5xl font-black leading-none text-pine">
              {formatPublicPrice(item.selling_price, item.currency)}
            </p>
          </div>

          {item.current_retail_price !== null && item.current_retail_price !== undefined && (
            <div>
              <p className="text-sm font-semibold text-ink/55">新品参考价</p>
              <p className="mt-1 text-lg font-bold text-ink/60 line-through">
                {formatPublicPrice(item.current_retail_price, item.currency)}
              </p>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-md bg-linen p-3 text-pine">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="text-lg font-black">仅 Bodenhoffs Plads 自取</p>
              <p className="mt-1 text-sm text-ink/65">不提供邮寄或配送。</p>
            </div>
          </div>

          <div className="grid gap-2 sm:flex">
            <a
              href={contactHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-pine px-4 text-base font-semibold text-white transition hover:bg-ink"
            >
              <Mail className="h-4 w-4" />
              联系
            </a>
            <ShareButton title={item.title} />
          </div>
        </div>
      </section>

      <section className="grid gap-5 pb-12">
        <div className="grid gap-4">
          <h2 className="text-2xl font-bold text-ink">商品描述</h2>
          <p className="whitespace-pre-line text-base leading-8 text-ink/72">
            {item.description || "暂无详细描述。"}
          </p>
        </div>

        <dl className="grid gap-3 rounded-lg border border-ink/10 bg-white p-4 text-sm">
          {[
            ["成色", item.condition],
            ["品牌", item.brand],
            ["型号", item.model]
          ].filter(([, value]) => Boolean(value)).map(([label, value]) => (
            <div key={label} className="grid grid-cols-[140px_1fr] gap-3 border-b border-ink/10 pb-3 last:border-0 last:pb-0">
              <dt className="font-semibold text-ink/55">{label}</dt>
              <dd className="font-medium text-ink">{value}</dd>
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
                参考链接
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </dl>
      </section>
    </main>
  );
}
