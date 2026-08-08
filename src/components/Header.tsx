'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { CategoryBar } from './CategoryBar';
import { SearchDialog } from './SearchDialog';
import { categorySlug, type CategoryNode } from '@/lib/catalog';

const pages = [
  { href: '/shop', label: 'Shop' },
  { href: '/specials', label: 'Specials' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Header({
  categories,
  phone,
}: {
  categories: CategoryNode[];
  phone: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
    setOpenCat(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-ink text-white">
        <div className="container-page flex h-16 items-center justify-between gap-3 sm:h-[4.5rem]">
          <Logo variant="light" priority />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="group flex items-center gap-2.5 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-sm text-ink-300 transition hover:border-white/25 hover:text-white sm:w-64 lg:w-80"
              aria-label="Search products"
            >
              <SearchIcon />
              <span className="hidden truncate sm:inline">Ask for anything…</span>
              <kbd className="ml-auto hidden shrink-0 rounded border border-white/15 px-1.5 py-0.5 font-mono text-[10px] text-ink-400 lg:inline">
                ⌘K
              </kbd>
            </button>

            <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
              {pages.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                    pathname === p.href
                      ? 'bg-white/10 text-white'
                      : 'text-ink-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {p.label}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/12 text-white lg:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        <CategoryBar categories={categories} />
      </header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] bg-ink transition-transform duration-300 lg:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 sm:h-[4.5rem] sm:px-6">
          <Logo variant="light" />
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/12 text-white"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="h-[calc(100dvh-4rem)] overflow-y-auto px-4 pb-10 sm:px-6">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setSearchOpen(true);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-ink-300"
          >
            <SearchIcon />
            Ask for anything…
          </button>

          <p className="eyebrow mb-2 mt-6 text-ink-400">Departments</p>
          <ul className="divide-y divide-white/8">
            {categories.map((c) => {
              const isOpen = openCat === c.slug;
              return (
                <li key={c.slug}>
                  <div className="flex items-center">
                    <Link
                      href={`/category/${categorySlug(c.path)}`}
                      className="flex-1 py-3.5 text-[15px] text-ink-100"
                    >
                      {c.name}
                      <span className="ml-2 font-mono text-xs text-ink-500">
                        {c.productCount}
                      </span>
                    </Link>
                    {c.children.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setOpenCat(isOpen ? null : c.slug)}
                        className="grid h-10 w-10 shrink-0 place-items-center text-ink-400"
                        aria-label={`${isOpen ? 'Hide' : 'Show'} ${c.name} sub-categories`}
                        aria-expanded={isOpen}
                      >
                        <svg
                          width="16" height="16" viewBox="0 0 24 24" fill="none"
                          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        >
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.9"
                            strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {isOpen && (
                    <ul className="pb-3 pl-3">
                      {c.children.map((sub) => (
                        <li key={sub.slug}>
                          <Link
                            href={`/category/${categorySlug(sub.path)}`}
                            className="block py-2 text-sm text-ink-400"
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <p className="eyebrow mb-2 mt-8 text-ink-400">Pages</p>
          <ul className="divide-y divide-white/8">
            {pages.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="block py-3.5 text-[15px] text-ink-100">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>

          <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn-primary mt-8 w-full">
            Call {phone}
          </a>
        </div>
      </div>
    </>
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

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.9" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}
