'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SAMPLE_QUERIES } from '@/lib/nlSearch';

/** Plain-English entry point that hands off to the shop's smart search. */
export function AskBar() {
  const [value, setValue] = useState('');
  const router = useRouter();

  const submit = (q: string) => {
    const trimmed = q.trim();
    if (trimmed) router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section className="relative z-10 -mt-px border-y border-white/10 bg-ink-950">
      <div className="container-page py-8 sm:py-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-flame-300">Not sure what you need?</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Just describe it
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(value);
            }}
            className="mt-5 flex flex-col gap-2 sm:flex-row"
          >
            <label htmlFor="ask" className="sr-only">
              Describe what you are looking for
            </label>
            <input
              id="ask"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="“a balsa kit a 13 year old could build, around R1500”"
              className="w-full rounded-lg border border-white/12 bg-white/[0.05] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-ink-500 focus:border-flame focus:bg-white/[0.08] sm:text-[15px]"
            />
            <button type="submit" className="btn-primary shrink-0">
              Find it
            </button>
          </form>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {SAMPLE_QUERIES.slice(0, 3).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setValue(s);
                  submit(s);
                }}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12px] text-ink-300 transition hover:border-flame/40 hover:text-white"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
