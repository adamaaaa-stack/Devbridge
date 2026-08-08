import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/ProductGrid';
import {
  categorySlug,
  formatPrice,
  getProduct,
  getRelated,
  products,
  STORE,
} from '@/lib/catalog';

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  return {
    title: product?.name || 'Product',
    description: product
      ? `${product.name} by ${product.brand} — ${formatPrice(product.price)} at Aerial Concepts.`
      : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getRelated(product);
  const crumbs = product.categoryPath.map((name, i) => ({
    name,
    href: `/category/${categorySlug(product.categoryPath.slice(0, i + 1))}`,
  }));

  return (
    <div className="section-pad">
      <div className="container-page">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-ink-400">
          <Link href="/shop" className="hover:text-ink">
            Shop
          </Link>
          {crumbs.map((c) => (
            <span key={c.href} className="contents">
              <span aria-hidden>/</span>
              <Link href={c.href} className="hover:text-ink">
                {c.name}
              </Link>
            </span>
          ))}
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-card">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-6 sm:p-10"
            />
          </div>

          <div className="flex flex-col">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-400">
              {product.brand}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-end gap-4">
              <p className="font-display text-3xl font-bold tracking-tight text-ink">
                {formatPrice(product.price)}
              </p>
              <span className="chip mb-1">{product.unit}</span>
              <span
                className={`mb-1 inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                  product.inStock
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-ink-50 text-ink-500'
                }`}
              >
                {product.inStock ? 'In stock' : 'Out of stock'}
              </span>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-4 rounded-xl border border-ink/10 bg-white p-5 text-sm">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-400">SKU</dt>
                <dd className="mt-1 font-medium">{product.sku}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-400">Brand</dt>
                <dd className="mt-1 font-medium">{product.brand}</dd>
              </div>
              <div className="col-span-2">
                <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
                  Category
                </dt>
                <dd className="mt-1 font-medium">{product.categoryPath.join(' · ')}</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" className="btn-primary flex-1" disabled={!product.inStock}>
                {product.inStock ? 'Add to cart' : 'Unavailable'}
              </button>
              <a
                href={`tel:${STORE.phone.replace(/\s/g, '')}`}
                className="btn-secondary flex-1"
              >
                Call to order
              </a>
            </div>
            <p className="mt-4 text-xs text-ink-400">
              Prototype cart — contact the shop to place a real order. Worldwide shipping on orders
              over R500.
            </p>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16 sm:mt-20">
            <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight">
              More in {product.categoryPath[0]}
            </h2>
            <ProductGrid products={related} />
          </div>
        )}
      </div>
    </div>
  );
}
