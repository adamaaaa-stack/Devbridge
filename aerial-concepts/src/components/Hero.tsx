import Image from 'next/image';
import Link from 'next/link';
import { STORE } from '@/lib/catalog';

export function Hero() {
  return (
    <section className="relative isolate min-h-[min(92dvh,720px)] overflow-hidden bg-ink text-white">
      <Image
        src="/hero/slide-1.webp"
        alt="RC aircraft from Aerial Concepts"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_35%] opacity-55"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
      <div
        className="pointer-events-none absolute inset-0 opacity-30 bg-blueprint-grid bg-[size:40px_40px]"
        aria-hidden
      />

      <div className="container-page relative flex min-h-[min(92dvh,720px)] flex-col justify-end pb-12 pt-24 sm:pb-16 sm:pt-28 lg:justify-center lg:pb-20">
        <div className="max-w-2xl animate-fade-up">
          <p className="eyebrow text-flame-300">{STORE.tagline}</p>
          <h1 className="mt-3 font-display text-[clamp(2.4rem,8vw,4.75rem)] font-bold leading-[0.95] tracking-tight text-balance">
            Aerial Concepts
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-200 sm:text-lg">
            The biggest model aircraft shop in South Africa — kits, jets, helicopters and flight gear,
            sorted the way pilots actually shop.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary">
              Shop the range
            </Link>
            <Link href="/category/aircraft-glider-kits" className="btn-ghost border border-white/20">
              Browse aircraft kits
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 border-t border-white/10 pt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300 sm:mt-14">
          <span>Worldwide shipping</span>
          <span>Retail shop · Kelvin</span>
          <span>{STORE.phone}</span>
        </div>
      </div>
    </section>
  );
}
