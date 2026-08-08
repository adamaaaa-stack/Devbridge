import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/ProductGrid';
import { CategoryTile } from '@/components/CategoryTile';
import {
  categorySlug,
  findCategory,
  getProductsByCategory,
  getTopCategories,
} from '@/lib/catalog';

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateStaticParams() {
  const params: { slug: string[] }[] = [];

  function walk(nodes: ReturnType<typeof getTopCategories>, prefix: string[] = []) {
    for (const n of nodes) {
      const path = [...prefix, n.slug];
      params.push({ slug: path });
      walk(n.children, path);
    }
  }
  walk(getTopCategories());
  return params;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const cat = findCategory(slug);
  return { title: cat?.name || 'Category' };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = findCategory(slug);
  if (!cat) notFound();

  const list = getProductsByCategory(cat.path);
  const crumbs = cat.path.map((name, i) => ({
    name,
    href: `/category/${categorySlug(cat.path.slice(0, i + 1))}`,
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

        <div className="max-w-2xl">
          <p className="eyebrow">Category</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {cat.name}
          </h1>
          <p className="mt-3 text-ink-500">
            {cat.productCount} product{cat.productCount === 1 ? '' : 's'}
            {cat.children.length > 0
              ? ` · ${cat.children.length} sub-categor${cat.children.length === 1 ? 'y' : 'ies'}`
              : ''}
          </p>
        </div>

        {cat.children.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 font-display text-xl font-semibold">Browse sub-categories</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cat.children.map((c, i) => (
                <CategoryTile key={c.slug} category={c} index={i} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-12">
          <h2 className="mb-5 font-display text-xl font-semibold">Products</h2>
          <ProductGrid products={list} />
        </div>
      </div>
    </div>
  );
}
