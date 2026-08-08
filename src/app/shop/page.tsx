import { ProductGrid } from '@/components/ProductGrid';
import { CategoryTile } from '@/components/CategoryTile';
import {
  getTopCategories,
  products,
  searchProducts,
} from '@/lib/catalog';

export const metadata = {
  title: 'Shop',
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ShopPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const list = searchProducts(q || '');
  const categories = getTopCategories();

  return (
    <div className="section-pad">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">Catalogue</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Shop
          </h1>
          <p className="mt-3 text-ink-500">
            {products.length} products across {categories.length} departments — demo catalogue
            sampled from the live Aerial Concepts range.
          </p>
        </div>

        <form action="/shop" className="mt-8 max-w-xl">
          <label htmlFor="q" className="sr-only">
            Search
          </label>
          <div className="flex gap-2">
            <input
              id="q"
              name="q"
              defaultValue={q || ''}
              type="search"
              placeholder="Search name, brand or SKU…"
              className="w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-sm shadow-sm focus:border-flame focus:outline-none focus:ring-2 focus:ring-flame/30"
            />
            <button type="submit" className="btn-ink shrink-0 !px-5">
              Search
            </button>
          </div>
        </form>

        {!q && (
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((c, i) => (
              <CategoryTile key={c.slug} category={c} index={i} />
            ))}
          </div>
        )}

        <div className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {q ? `Results for “${q}”` : 'All products'}
            </h2>
            <p className="font-mono text-xs text-ink-400">{list.length} items</p>
          </div>
          <ProductGrid products={list} />
        </div>
      </div>
    </div>
  );
}
