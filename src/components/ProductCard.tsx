import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, type Product } from '@/lib/catalog';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className="product-tile group">
      <div className="relative aspect-square overflow-hidden bg-ink-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-3 transition duration-500 group-hover:scale-[1.04] sm:p-4"
        />
        {!product.inStock && (
          <span className="absolute left-2 top-2 rounded bg-ink/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            Out of stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 border-t border-ink/5 p-3 sm:p-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400">{product.brand}</p>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink sm:text-[0.95rem]">
          {product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <p className="font-display text-base font-semibold tracking-tight text-ink sm:text-lg">
            {formatPrice(product.price)}
          </p>
          <span className="chip">{product.unit}</span>
        </div>
      </div>
    </Link>
  );
}
