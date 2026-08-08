import { ProductGrid } from '@/components/ProductGrid';
import { CategoryBlock } from '@/components/CategoryBlock';
import { ShopSearch } from '@/components/ShopSearch';
import { Reveal } from '@/components/Reveal';
import { getTopCategories, products } from '@/lib/catalog';
import { smartSearch } from '@/lib/nlSearch';

export const metadata = {
  title: 'Shop',
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ShopPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const categories = getTopCategories();
  const query = q?.trim() || '';
  const { parsed, results } = smartSearch(query);
  const list = query ? results.map((r) => r.product) : products;

  return (
    <div className="section-pad">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">Catalogue</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Shop
          </h1>
          <p className="mt-3 text-ink-500">
            {products.length} products across {categories.length} departments. Search in plain
            English — budgets, skill level and age all count.
          </p>
        </div>

        <div className="mt-7 max-w-2xl">
          <ShopSearch initial={query} />
          {query && parsed.understood.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
                Reading as
              </span>
              {parsed.understood.map((u) => (
                <span
                  key={u}
                  className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium shadow-sm ring-1 ring-ink/5"
                >
                  {u}
                </span>
              ))}
            </div>
          )}
        </div>

        {!query && (
          <div className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {categories.map((c, i) => (
              <Reveal key={c.slug} delay={(i % 3) * 70}>
                <CategoryBlock category={c} index={i} />
              </Reveal>
            ))}
          </div>
        )}

        <div className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {query ? `Results for “${query}”` : 'All products'}
            </h2>
            <p className="shrink-0 font-mono text-xs text-ink-400">{list.length} items</p>
          </div>
          <ProductGrid products={list} />
        </div>
      </div>
    </div>
  );
}
