import Link from 'next/link';

type Props = {
  className?: string;
  href?: string;
  variant?: 'light' | 'dark';
};

export function Logo({ className = '', href = '/', variant = 'dark' }: Props) {
  const color = variant === 'light' ? 'text-white' : 'text-ink';

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 ${color} ${className}`}
      aria-label="Aerial Concepts home"
    >
      <span className="relative grid h-9 w-9 place-items-center rounded-lg bg-flame text-white sm:h-10 sm:w-10">
        <svg viewBox="0 0 32 32" className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" fill="none" aria-hidden>
          <path
            d="M4 18.5c6.2-1 14.2-4.8 20.4-9.6 1-.8 2 .5 1.2 1.5-3.6 4.2-8.6 8.6-13.6 11.6-.6.4-1.2-.2-1-.8.3-1.4.3-2.8-.2-4-.3-.6-1-.8-1.6-.5L4 18.5z"
            fill="currentColor"
          />
          <path
            d="M7.2 14.2c4.4-2.8 10.2-5.8 15.6-7.4.7-.2 1.2.5.8 1.1-2.9 3.2-7 6.6-11 9.1-.5.3-1.1-.2-.9-.8.4-1 .3-2-.2-2.8-.2-.5-.8-.6-1.2-.4L7.2 14.2z"
            fill="currentColor"
            opacity=".55"
          />
          <circle cx="5.6" cy="19.2" r="1.3" fill="currentColor" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block font-display text-[1.05rem] font-bold tracking-[0.04em] sm:text-lg">
          AERIAL
        </span>
        <span className="mt-0.5 block font-display text-[0.68rem] font-medium tracking-[0.28em] opacity-70 sm:text-[0.72rem]">
          CONCEPTS
        </span>
      </span>
    </Link>
  );
}
