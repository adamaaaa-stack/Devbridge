import { ProductCard } from './ProductCard';
import type { Product } from '@/lib/catalog';

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink/15 bg-white/60 px-6 py-16 text-center">
        <p className="font-display text-xl font-semibold">No products here yet</p>
        <p className="mt-2 text-sm text-ink-500">Try another category or clear your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.sku} product={p} />
      ))}
    </div>
  );
}
