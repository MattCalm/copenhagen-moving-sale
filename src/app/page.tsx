import { SaleBrowser } from "@/components/SaleBrowser";
import { getAppSettings, getItems } from "@/lib/items";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function Home() {
  const [items, settings] = await Promise.all([getItems(), getAppSettings()]);

  return (
    <main>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-8 pt-10 sm:px-6 md:pt-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-[1fr_280px] md:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-clay">Personal moving sale</p>
            <h1 className="mt-3 text-4xl font-black leading-none text-ink sm:text-6xl">
              Copenhagen Moving Sale
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
              Well-kept furniture, home pieces, and everyday finds for pickup in Copenhagen before I move out.
              Everything here is managed live, so availability and prices stay current.
            </p>
          </div>
          <div className="rounded-lg border border-pine/15 bg-pine p-5 text-white shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/65">Pickup location</p>
            <p className="mt-2 text-2xl font-bold">Copenhagen</p>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Message from an item page to arrange a time. Reserved items are still shown until picked up.
            </p>
          </div>
        </div>
      </section>

      <SaleBrowser items={items} hideSoldHomepage={settings.hide_sold_homepage} />
    </main>
  );
}
