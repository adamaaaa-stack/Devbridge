import Image from 'next/image';
import Link from 'next/link';
import {
  categoryPreview,
  categorySlug,
  type CategoryNode,
} from '@/lib/catalog';

/**
 * Embossed department block: real product imagery pressed into the surface,
 * with the sub-categories exposed as direct options.
 */
export function CategoryBlock({
  category,
  index = 0,
  tone = 'dark',
}: {
  category: CategoryNode;
  index?: number;
  tone?: 'dark' | 'light';
}) {
  const preview = categoryPreview(category, 3);
  const options = category.children.slice(0, 4);
  const href = `/category/${categorySlug(category.path)}`;
  const dark = tone === 'dark';

  return (
    <div
      className={
        dark
          ? 'group relative isolate overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-ink-800 to-ink-950 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_40px_-24px_rgba(0,0,0,0.9)] transition duration-500 hover:border-white/15 sm:p-6'
          : 'group relative isolate overflow-hidden rounded-2xl border border-ink/10 bg-white p-5 shadow-card transition duration-300 hover:border-ink/20 hover:shadow-lift sm:p-6'
      }
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Embossed relief of the actual items in this department */}
      <div className="pointer-events-none absolute -right-4 -top-2 flex items-start gap-2 opacity-[0.16] transition duration-700 group-hover:opacity-30 sm:-right-2">
        {preview.map((p, i) => (
          <div
            key={p.sku}
            className="relative h-24 w-24 sm:h-28 sm:w-28"
            style={{
              transform: `translateY(${i * 10}px) rotate(${(i - 1) * 6}deg)`,
              filter: 'grayscale(1) contrast(1.35) brightness(1.5)',
              mixBlendMode: dark ? 'luminosity' : 'multiply',
            }}
          >
            <Image
              src={p.image}
              alt=""
              fill
              sizes="112px"
              className="object-contain drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]"
            />
          </div>
        ))}
      </div>
      <div
        className={`pointer-events-none absolute inset-0 bg-blueprint-grid bg-[size:26px_26px] ${
          dark ? 'opacity-[0.07]' : 'opacity-[0.04]'
        }`}
        aria-hidden
      />

      <div className="relative">
        <p
          className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
            dark ? 'text-flame-300' : 'text-flame'
          }`}
        >
          {category.productCount} item{category.productCount === 1 ? '' : 's'}
        </p>
        <h3
          className={`mt-1.5 font-display text-xl font-semibold leading-tight tracking-tight sm:text-2xl ${
            dark ? 'text-white' : 'text-ink'
          }`}
        >
          <Link href={href} className="hover:underline">
            {category.name}
          </Link>
        </h3>

        {options.length > 0 && (
          <ul className="relative z-10 mt-4 flex flex-wrap gap-1.5">
            {options.map((sub) => (
              <li key={sub.slug}>
                <Link
                  href={`/category/${categorySlug(sub.path)}`}
                  className={
                    dark
                      ? 'inline-flex items-center rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[12px] text-ink-200 transition hover:border-flame/50 hover:bg-flame/10 hover:text-white'
                      : 'inline-flex items-center rounded-md border border-ink/10 bg-ink-50 px-2.5 py-1 text-[12px] text-ink-600 transition hover:border-flame/40 hover:bg-flame-50 hover:text-ink'
                  }
                >
                  {sub.name}
                </Link>
              </li>
            ))}
            {category.children.length > options.length && (
              <li>
                <Link
                  href={href}
                  className={
                    dark
                      ? 'inline-flex items-center rounded-md px-2 py-1 text-[12px] text-ink-400 hover:text-white'
                      : 'inline-flex items-center rounded-md px-2 py-1 text-[12px] text-ink-400 hover:text-ink'
                  }
                >
                  +{category.children.length - options.length} more
                </Link>
              </li>
            )}
          </ul>
        )}

        <Link
          href={href}
          className={`relative z-10 mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold transition ${
            dark
              ? 'text-white/70 hover:text-flame-300'
              : 'text-ink-500 hover:text-flame'
          }`}
        >
          Browse department
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            <path
              d="M5 12h14m-6-6 6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
