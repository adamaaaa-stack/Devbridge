import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 text-ink-500">That runway doesn&apos;t exist on this prototype.</p>
      <Link href="/" className="btn-primary mt-8">
        Back home
      </Link>
    </div>
  );
}
