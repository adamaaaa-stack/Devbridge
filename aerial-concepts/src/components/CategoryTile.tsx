import Link from 'next/link';
import { categorySlug, type CategoryNode } from '@/lib/catalog';

const accents = [
  'from-sky-600/90 to-ink-900',
  'from-flame-600/90 to-ink-900',
  'from-ink-700 to-ink-950',
  'from-sky-700/80 to-ink-900',
  'from-flame-500/80 to-ink-900',
];

export function CategoryTile({
  category,
  index = 0,
}: {
  category: CategoryNode;
  index?: number;
}) {
  const accent = accents[index % accents.length];

  return (
    <Link
      href={`/category/${categorySlug(category.path)}`}
      className="group relative flex min-h-[140px] flex-col justify-end overflow-hidden rounded-xl p-4 text-white sm:min-h-[160px] sm:p-5"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} />
      <div
        className="absolute inset-0 opacity-40 bg-blueprint-grid bg-[size:22px_22px] transition duration-500 group-hover:opacity-60"
        aria-hidden
      />
      <PlaneSilhouette className="absolute -right-2 top-3 h-16 w-16 opacity-20 transition duration-500 group-hover:translate-x-1 group-hover:opacity-35 sm:h-20 sm:w-20" />
      <div className="relative">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
          {category.productCount} items
        </p>
        <h3 className="mt-1 font-display text-lg font-semibold leading-tight tracking-tight sm:text-xl">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}

function PlaneSilhouette({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor" aria-hidden>
      <path d="M6 34c14-3 30-12 42-20 2-1.4 3.8.8 2.4 2.6-7 9-17 18-27 24-1.2.7-2.4-.3-2-1.5.7-2.6.6-5.2-.4-7.4-.5-1.2-1.9-1.6-3-.9L6 34z" />
      <path d="M14 26c9-6 21-12 32-15 1.5-.4 2.5 1.1 1.6 2.2-6 6.6-14.5 14-22.5 19.2-1 .6-2.2-.4-1.8-1.5.8-2 .6-4-.4-5.6-.5-1-1.6-1.3-2.5-.8L14 26z" opacity=".5" />
    </svg>
  );
}
