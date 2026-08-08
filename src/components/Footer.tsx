import Link from 'next/link';
import { Logo } from './Logo';
import { categorySlug, getTopCategories, STORE } from '@/lib/catalog';

export function Footer() {
  const categories = getTopCategories().slice(0, 8);

  return (
    <footer className="border-t border-white/10 bg-ink text-ink-200">
      <div className="container-page section-pad grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        <div className="lg:col-span-1">
          <Logo variant="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-300">
            {STORE.tagline}. Model aircraft, jets, helicopters and the parts to keep them flying —
            from Kelvin, Sandton to pilots worldwide.
          </p>
        </div>

        <div>
          <p className="eyebrow text-ink-400">Shop</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/shop" className="hover:text-white">
                All products
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${categorySlug(c.path)}`} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-ink-400">Visit</p>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-300">
            <li>{STORE.address}</li>
            {STORE.hours.map((h) => (
              <li key={h.day}>
                <span className="text-ink-100">{h.day}</span>
                <span className="mx-2 text-ink-500">·</span>
                {h.time}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-ink-400">Contact</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a href={`tel:${STORE.phone.replace(/\s/g, '')}`} className="hover:text-white">
                {STORE.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${STORE.email}`} className="hover:text-white">
                {STORE.email}
              </a>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Get directions
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {STORE.name}. Prototype redesign — for demonstration.</p>
          <p className="font-mono tracking-wide">WORLDWIDE SHIPPING · R500+</p>
        </div>
      </div>
    </footer>
  );
}
