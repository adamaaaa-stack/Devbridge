import Image from 'next/image';
import Link from 'next/link';

type Props = {
  className?: string;
  href?: string;
  variant?: 'light' | 'dark';
  priority?: boolean;
};

/** The shop's own wordmark, recoloured for dark chrome. */
export function Logo({ className = '', href = '/', variant = 'dark', priority }: Props) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center ${className}`}
      aria-label="Aerial Concepts home"
    >
      <Image
        src={variant === 'light' ? '/brand/logo-light.png' : '/brand/logo-dark.png'}
        alt="Aerial Concepts — Flown with Passion"
        width={300}
        height={82}
        priority={priority}
        className="h-9 w-auto sm:h-11"
      />
    </Link>
  );
}
