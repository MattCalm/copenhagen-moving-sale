import { SaleBrowser } from "@/components/SaleBrowser";
import { getItems } from "@/lib/items";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function Home() {
  const items = await getItems();

  return (
    <main className="min-h-screen">
      <section className="mx-auto grid max-w-4xl gap-5 px-4 pb-5 pt-8 sm:px-6">
        <h1 className="text-3xl font-black leading-tight text-ink sm:text-5xl">
          哥本哈根搬家二手清仓
        </h1>

        <div className="grid gap-2 rounded-lg border border-pine/15 bg-pine p-4 text-white">
          <p className="text-xl font-black sm:text-2xl">📍 仅 Bodenhoffs Plads 自取</p>
          <p className="text-sm leading-6 text-white/85">
            不提供邮寄或配送，请确认可以到 Bodenhoffs Plads 自取后再联系。
          </p>
        </div>
      </section>

      <SaleBrowser items={items} />
    </main>
  );
}
