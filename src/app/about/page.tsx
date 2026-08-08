import Image from 'next/image';
import Link from 'next/link';
import { STORE } from '@/lib/catalog';

export const metadata = {
  title: 'About',
};

export default function AboutPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <Image
          src="/hero/slide-2.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/50" />
        <div className="container-page relative py-20 sm:py-28">
          <p className="eyebrow text-flame-300">{STORE.tagline}</p>
          <h1 className="mt-3 max-w-xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Built for pilots who take the hobby seriously
          </h1>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              South Africa&apos;s model aircraft home
            </h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              Aerial Concepts is the country&apos;s biggest specialist RC shop — aircraft kits,
              jets, helicopters, drones, radios, power systems and the hardware that holds a build
              together. From Kelvin, Sandton we supply weekend pilots and competition flyers across
              South Africa and abroad.
            </p>
            <p className="mt-4 text-ink-500 leading-relaxed">
              This site is a redesign prototype: the same stock and categories, organised cleanly
              for phones, tablets and desktops — ready to show how the shop could look online.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-primary">
                Explore the shop
              </Link>
              <Link href="/contact" className="btn-secondary">
                Visit the store
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { t: 'Full-range stock', d: 'Kits through tiny fasteners — departments, not a wall of links.' },
              { t: 'Retail showroom', d: STORE.address },
              { t: 'Expert advice', d: 'Talk to people who fly what they sell.' },
              { t: 'Worldwide shipping', d: 'Orders over R500 ship internationally.' },
            ].map((item) => (
              <div key={item.t} className="rounded-xl border border-ink/10 bg-white p-5 shadow-card">
                <h3 className="font-display text-lg font-semibold">{item.t}</h3>
                <p className="mt-2 text-sm text-ink-500">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
