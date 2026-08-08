import Image from 'next/image';
import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { CategoryBlock } from '@/components/CategoryBlock';
import { ProductGrid } from '@/components/ProductGrid';
import { SpecialCard } from '@/components/SpecialCard';
import { Reveal } from '@/components/Reveal';
import { AskBar } from '@/components/AskBar';
import {
  getFeaturedProducts,
  getSpecials,
  getTopCategories,
  products,
  STORE,
} from '@/lib/catalog';

export default function HomePage() {
  const categories = getTopCategories();
  const featured = getFeaturedProducts(8);
  const specials = getSpecials().slice(0, 4);

  return (
    <>
      <Hero />

      <AskBar />

      <section className="bg-ink-950 section-pad">
        <div className="container-page">
          <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-flame-300">Departments</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Everything in its place
              </h2>
              <p className="mt-2 max-w-lg text-sm text-ink-300 sm:text-base">
                Jump straight to a sub-category — no digging through a wall of links.
              </p>
            </div>
            <Link href="/shop" className="btn-ghost self-start border border-white/20 sm:self-auto">
              All {products.length} products
            </Link>
          </Reveal>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {categories.map((c, i) => (
              <Reveal key={c.slug} delay={(i % 3) * 80}>
                <CategoryBlock category={c} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {specials.length > 0 && (
        <section className="border-y border-ink/8 bg-white section-pad">
          <div className="container-page">
            <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-flame">On special</p>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  Marked down this month
                </h2>
              </div>
              <Link href="/specials" className="text-sm font-semibold text-flame hover:text-flame-600">
                All specials →
              </Link>
            </Reveal>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {specials.map((p, i) => (
                <Reveal key={p.sku} delay={(i % 4) * 70}>
                  <SpecialCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-pad">
        <div className="container-page">
          <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Featured</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready for the flight line
              </h2>
            </div>
            <Link href="/shop" className="text-sm font-semibold text-flame hover:text-flame-600">
              See the full shop →
            </Link>
          </Reveal>
          <Reveal className="mt-8" delay={80}>
            <ProductGrid products={featured} />
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0">
          <Image src="/hero/slide-3.webp" alt="" fill sizes="100vw" className="object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/92 to-ink/70" />
        </div>
        <div className="container-page relative grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <Reveal>
            <p className="eyebrow text-flame-300">Retail · Sandton</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Walk in. Talk planes. Leave ready to fly.
            </h2>
            <p className="mt-4 max-w-md text-ink-200">
              Visit the Kelvin showroom for advice, collection and the full wall of kits that never
              fits on a screen.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary">
                Visit &amp; contact
              </Link>
              <a href={`tel:${STORE.phone.replace(/\s/g, '')}`} className="btn-ghost border border-white/20">
                {STORE.phone}
              </a>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-300">
                Trading hours
              </p>
              <ul className="mt-5 space-y-3 text-sm">
                {STORE.hours.map((h) => (
                  <li
                    key={h.day}
                    className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3 last:border-0"
                  >
                    <span className="text-ink-100">{h.day}</span>
                    <span className="font-mono text-ink-300">{h.time}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-ink-300">{STORE.address}</p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
