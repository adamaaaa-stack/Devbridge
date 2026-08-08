'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SAMPLE_QUERIES } from '@/lib/nlSearch';

export function ShopSearch({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  const router = useRouter();

  const go = (q: string) => {
    const trimmed = q.trim();
    router.push(trimmed ? `/shop?q=${encodeURIComponent(trimmed)}` : '/shop');
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(value);
        }}
        className="flex gap-2"
      >
        <label htmlFor="shop-q" className="sr-only">
          Search products
        </label>
        <input
          id="shop-q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="search"
          placeholder="“beginner foam plane under R1000”"
          className="w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-flame focus:ring-2 focus:ring-flame/25"
        />
        <button type="submit" className="btn-ink shrink-0 !px-5">
          Search
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {SAMPLE_QUERIES.slice(0, 3).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setValue(s);
              go(s);
            }}
            className="rounded-full border border-ink/12 bg-white px-3 py-1.5 text-[12px] text-ink-500 transition hover:border-flame/50 hover:text-ink"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
