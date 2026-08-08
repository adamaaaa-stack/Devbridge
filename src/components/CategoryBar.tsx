'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { categorySlug, type CategoryNode } from '@/lib/catalog';

/**
 * Slim, always-present department rail. Scrolls horizontally on touch,
 * reveals a sub-category flyout on pointer devices.
 */
export function CategoryBar({ categories }: { categories: CategoryNode[] }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  useEffect(() => setOpenSlug(null), [pathname]);

  const open = (slug: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenSlug(slug);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenSlug(null), 120);
  };

  return (
    <div
      className="relative border-b border-white/10 bg-ink-950/95 backdrop-blur"
      onMouseLeave={scheduleClose}
    >
      <div className="container-page">
        <div
          className="scrollbar-none -mx-1 flex items-stretch gap-0.5 overflow-x-auto"
          role="navigation"
          aria-label="Departments"
        >
          <Link
            href="/specials"
            className="group flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-[13px] font-semibold text-flame-300 hover:text-flame-200"
          >
            <SparkIcon />
            Specials
          </Link>
          <span className="my-2 w-px shrink-0 bg-white/10" aria-hidden />

          {categories.map((c) => {
            const href = `/category/${categorySlug(c.path)}`;
            const active = pathname.startsWith(href);
            return (
              <div key={c.slug} className="shrink-0" onMouseEnter={() => open(c.slug)}>
                <Link
                  href={href}
                  className={`block whitespace-nowrap px-3 py-2.5 text-[13px] transition-colors ${
                    active || openSlug === c.slug
                      ? 'text-white'
                      : 'text-ink-300 hover:text-white'
                  }`}
                >
                  {c.name}
                  <span
                    className={`mx-auto mt-1 block h-px origin-left bg-flame transition-transform duration-300 ${
                      active || openSlug === c.slug ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sub-category flyout */}
      {categories.map((c) =>
        openSlug === c.slug && c.children.length > 0 ? (
          <div
            key={`fly-${c.slug}`}
            className="absolute inset-x-0 top-full z-40 hidden border-b border-white/10 bg-ink-950/98 shadow-lift backdrop-blur lg:block"
            onMouseEnter={() => open(c.slug)}
            onMouseLeave={scheduleClose}
          >
            <div className="container-page grid grid-cols-4 gap-x-6 gap-y-1 py-5">
              {c.children.map((sub) => (
                <div key={sub.slug} className="min-w-0">
                  <Link
                    href={`/category/${categorySlug(sub.path)}`}
                    className="block truncate py-1 text-sm font-medium text-white hover:text-flame-300"
                  >
                    {sub.name}
                  </Link>
                  {sub.children.slice(0, 4).map((leaf) => (
                    <Link
                      key={leaf.slug}
                      href={`/category/${categorySlug(leaf.path)}`}
                      className="block truncate py-0.5 text-[13px] text-ink-400 hover:text-ink-100"
                    >
                      {leaf.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
}

function SparkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.2 6.3L20.5 10l-6.3 2.2L12 18.5l-2.2-6.3L3.5 10l6.3-1.7L12 2z" />
    </svg>
  );
}
