import { SpecialCard } from '@/components/SpecialCard';
import { Reveal } from '@/components/Reveal';
import { formatPrice, getSpecials } from '@/lib/catalog';

export const metadata = {
  title: 'Specials',
};

export default function SpecialsPage() {
  const specials = getSpecials();
  const totalSaving = specials.reduce(
    (sum, p) => sum + ((p.wasPrice || p.price) - p.price),
    0,
  );
  const deepest = specials[0];

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-20 bg-blueprint-grid bg-[size:38px_38px]"
          aria-hidden
        />
        <div className="container-page relative py-14 sm:py-20">
          <p className="eyebrow text-flame-300">Marked down</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Specials
          </h1>
          <p className="mt-3 max-w-lg text-ink-300">
            Current price drops across the range — while stock lasts.
          </p>

          <dl className="mt-9 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="On special" value={String(specials.length)} />
            <Stat label="Total saving" value={formatPrice(totalSaving)} />
            {deepest && (
              <Stat label="Biggest drop" value={`−${deepest.discountPct}%`} accent />
            )}
          </dl>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {specials.map((p, i) => (
              <Reveal key={p.sku} delay={(i % 4) * 70}>
                <SpecialCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5">
      <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-400">{label}</dt>
      <dd
        className={`mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl ${
          accent ? 'text-flame' : 'text-white'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
