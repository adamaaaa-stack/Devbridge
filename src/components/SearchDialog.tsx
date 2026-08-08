'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { formatPrice } from '@/lib/catalog';
import { smartSearch, SAMPLE_QUERIES } from '@/lib/nlSearch';

export function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { parsed, results } = useMemo(() => smartSearch(query), [query]);
  const showing = query.trim() ? results.slice(0, 8) : [];

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
      />

      <div className="relative mt-2 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-lift sm:mt-12">
        <div className="flex items-center gap-3 border-b border-ink/10 px-4 py-3.5 sm:px-5">
          <SearchIcon />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what you need, in your own words…"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-ink-400 sm:text-base"
            aria-label="Search products"
          />
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md px-2 py-1 font-mono text-[11px] text-ink-400 hover:bg-ink-50"
          >
            ESC
          </button>
        </div>

        {/* What the parser understood */}
        {query.trim() && parsed.understood.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-b border-ink/10 bg-ink-50/60 px-4 py-2.5 sm:px-5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
              Reading as
            </span>
            {parsed.understood.map((u) => (
              <span
                key={u}
                className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-ink shadow-sm ring-1 ring-ink/5"
              >
                {u}
              </span>
            ))}
          </div>
        )}

        <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
          {!query.trim() && (
            <div className="px-4 py-5 sm:px-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
                Try asking for
              </p>
              <ul className="mt-3 grid gap-1.5">
                {SAMPLE_QUERIES.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => setQuery(s)}
                      className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-ink-600 transition hover:bg-ink-50 hover:text-ink"
                    >
                      “{s}”
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {query.trim() && showing.length === 0 && (
            <div className="px-5 py-12 text-center">
              <p className="font-display text-lg font-semibold">Nothing matched</p>
              <p className="mt-1.5 text-sm text-ink-500">
                Try fewer words, or widen the budget.
              </p>
            </div>
          )}

          {showing.map(({ product, reasons }) => (
            <Link
              key={product.sku}
              href={`/product/${product.slug}`}
              onClick={onClose}
              className="flex items-center gap-3 border-b border-ink/5 px-4 py-3 transition hover:bg-ink-50 sm:gap-4 sm:px-5"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-50 sm:h-16 sm:w-16">
                <Image
                  src={product.image}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain p-1.5"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
                  {product.brand}
                </p>
                <p className="truncate text-sm font-medium">{product.name}</p>
                {reasons.length > 0 && (
                  <p className="mt-0.5 truncate text-[11px] text-ink-400">
                    {reasons.slice(0, 2).join(' · ')}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-sm font-semibold sm:text-base">
                  {formatPrice(product.price)}
                </p>
                {product.wasPrice && (
                  <p className="text-[11px] text-ink-400 line-through">
                    {formatPrice(product.wasPrice)}
                  </p>
                )}
              </div>
            </Link>
          ))}

          {query.trim() && results.length > showing.length && (
            <Link
              href={`/shop?q=${encodeURIComponent(query)}`}
              onClick={onClose}
              className="block px-5 py-3.5 text-center text-sm font-semibold text-flame hover:bg-ink-50"
            >
              See all {results.length} results →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-ink-400" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.9" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}
