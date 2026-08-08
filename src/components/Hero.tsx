import Image from 'next/image';
import Link from 'next/link';
import { PlaneFlyover } from './PlaneFlyover';
import { STORE } from '@/lib/catalog';

export function Hero() {
  return (
    <section className="relative isolate min-h-[min(90dvh,760px)] overflow-hidden bg-ink text-white">
      <Image
        src="/hero/slide-1.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="animate-taxi object-cover object-[center_35%] opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/50" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22] bg-blueprint-grid bg-[size:44px_44px]"
        aria-hidden
      />

      {/* 3D flyover */}
      <PlaneFlyover className="z-[1]" />

      <div className="container-page relative z-[2] flex min-h-[min(90dvh,760px)] flex-col justify-end pb-14 pt-24 sm:pb-16 lg:justify-center lg:pb-24">
        <div className="max-w-2xl animate-fade-up">
          <p className="eyebrow text-flame-300">{STORE.tagline}</p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,8.5vw,5rem)] font-bold leading-[0.94] tracking-tight text-balance">
            The whole sky,
            <br />
            <span className="text-flame">in stock.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-200 sm:text-lg">
            South Africa&apos;s biggest model aircraft shop — kits, jets, helicopters and flight
            gear, sorted the way pilots actually shop.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary">
              Shop the range
            </Link>
            <Link href="/specials" className="btn-ghost border border-white/20">
              See specials
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-x-8 gap-y-2 border-t border-white/10 pt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300 sm:mt-16">
          <span>Worldwide shipping</span>
          <span>Retail shop · Kelvin</span>
          <span>{STORE.phone}</span>
        </div>
      </div>
    </section>
  );
}
