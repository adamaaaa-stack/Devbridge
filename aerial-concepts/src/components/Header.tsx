'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { getTopCategories, STORE } from '@/lib/catalog';

const links = [
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const pathname = usePathname();
  const categories = getTopCategories();

  useEffect(() => {
    setOpen(false);
    setCatsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink text-white">
      <div className="border-b border-white/10 bg-ink-950/80">
        <div className="container-page flex h-8 items-center justify-between text-[11px] text-ink-300 sm:h-9 sm:text-xs">
          <p className="truncate">South Africa&apos;s biggest model aircraft shop</p>
          <a href={`tel:${STORE.phone.replace(/\s/g, '')}`} className="shrink-0 hover:text-white">
            {STORE.phone}
          </a>
        </div>
      </div>

      <div className="container-page flex h-14 items-center justify-between gap-3 sm:h-16">
        <Logo variant="light" />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          <div
            className="relative"
            onMouseEnter={() => setCatsOpen(true)}
            onMouseLeave={() => setCatsOpen(false)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-ink-100 hover:bg-white/10 hover:text-white"
              aria-expanded={catsOpen}
            >
              Categories
              <ChevronDown />
            </button>
            {catsOpen && (
              <div className="absolute left-0 top-full z-50 w-[min(36rem,70vw)] pt-2">
                <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-ink-900 p-3 shadow-lift">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/category/${c.slug}`}
                      className="rounded-lg px-3 py-2.5 text-sm text-ink-100 hover:bg-white/10 hover:text-white"
                    >
                      <span className="block font-medium">{c.name}</span>
                      <span className="mt-0.5 block font-mono text-[11px] text-ink-400">
                        {c.productCount} items
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                pathname === l.href
                  ? 'bg-white/10 text-white'
                  : 'text-ink-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/shop" className="btn-primary hidden !px-4 !py-2.5 sm:inline-flex">
            Browse shop
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-md border border-white/15 text-white lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 top-[calc(2rem+3.5rem)] z-40 bg-ink transition-transform duration-300 sm:top-[calc(2.25rem+4rem)] lg:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="container-page flex h-full flex-col overflow-y-auto pb-10 pt-4 safe-pb">
          <form action="/shop" className="mb-5">
            <label htmlFor="mobile-search" className="sr-only">
              Search products
            </label>
            <input
              id="mobile-search"
              name="q"
              type="search"
              placeholder="Search kits, motors, radios…"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-ink-400 focus:border-flame focus:outline-none"
            />
          </form>

          <p className="eyebrow mb-3 text-ink-400">Categories</p>
          <div className="mb-6 grid gap-1">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="flex items-center justify-between rounded-lg px-3 py-3 text-base text-ink-100 hover:bg-white/10"
              >
                <span>{c.name}</span>
                <span className="font-mono text-xs text-ink-400">{c.productCount}</span>
              </Link>
            ))}
          </div>

          <p className="eyebrow mb-3 text-ink-400">Pages</p>
          <div className="grid gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-3 text-base text-ink-100 hover:bg-white/10"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="mt-auto border-t border-white/10 pt-6">
            <a href={`tel:${STORE.phone.replace(/\s/g, '')}`} className="btn-primary w-full">
              Call {STORE.phone}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
